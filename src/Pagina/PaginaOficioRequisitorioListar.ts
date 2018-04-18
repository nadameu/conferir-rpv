import BotaoAcao from '../BotaoAcao';
import Pagina from './Pagina';
import { ConversorData } from '../Conversor';

export default class PaginaOficioRequisitorioListar extends Pagina {
	async adicionarAlteracoes() {
		const barra = await this.query<HTMLDivElement>(
			'#divInfraBarraComandosSuperior'
		);
		const fragment = this.doc.createDocumentFragment();
		const botaoCarregarPaginas = this.adicionarBotaoCarregarPaginas();
		if (botaoCarregarPaginas) {
			fragment.appendChild(botaoCarregarPaginas);
			botaoCarregarPaginas.insertAdjacentHTML('afterend', '&nbsp;\n');
		}
		const botaoOrdenar = this.adicionarBotaoOrdenar();
		fragment.appendChild(botaoOrdenar);
		botaoOrdenar.insertAdjacentHTML('afterend', '&nbsp;\n');
		barra.insertBefore(fragment, barra.firstChild);
	}

	adicionarBotaoCarregarPaginas() {
		const paginacao = this.queryAll<HTMLSelectElement>(
			'#selInfraPaginacaoSuperior'
		);
		if (paginacao.length === 0) return null;
		if (paginacao[0].value !== '0') return null;
		return BotaoAcao.criar(
			'Carregar todas as páginas',
			this.onBotaoCarregarPaginasClicked.bind(this)
		);
	}

	adicionarBotaoOrdenar() {
		return BotaoAcao.criar(
			'Ordenar por data de trânsito',
			this.onBotaoOrdenarClicked.bind(this)
		);
	}

	onBotaoCarregarPaginasClicked(evt: Event) {
		evt.preventDefault();
		var self = this;
		const botao = <HTMLButtonElement>evt.target;
		const originalText = botao.textContent;
		(async function() {
			const tabela = await self.query<HTMLTableElement>(
				'#divInfraAreaTabela > table'
			);
			const paginacao = await self.query<HTMLSelectElement>(
				'#selInfraPaginacaoSuperior'
			);
			const paginas = paginacao.options.length;
			const paginaAtual = await self.query<HTMLInputElement>(
				'#hdnInfraPaginaAtual'
			);
			const form = await queryParent<HTMLFormElement>(paginaAtual, 'form');
			const data = new FormData(form);
			return limitConcurrency(
				1,
				pagina =>
					new Promise<Document>((res, rej) => {
						botao.textContent = `Carregando página ${pagina + 1}...`;
						data.set('hdnInfraPaginaAtual', pagina.toString());
						const xhr = new XMLHttpRequest();
						xhr.open('POST', self.doc.location.href);
						xhr.responseType = 'document';
						xhr.addEventListener('load', () => res(xhr.response));
						xhr.addEventListener('error', rej);
						xhr.send(data);
					})
						.then(doc => {
							return doc.querySelectorAll<HTMLTableRowElement>(
								'#divInfraAreaTabela > table > tbody > tr:nth-child(n + 2)'
							);
						})
						.then(linhas => {
							linhas.forEach(linha => tabela.appendChild(linha));
						}),
				Array.from({ length: paginas - 1 }, (_, i) => i + 1)
			)
				.then(() => {
					botao.textContent = originalText;
					return self.query<HTMLTableCaptionElement>('caption', tabela);
				})
				.then(caption => {
					const match = (caption.textContent || '').match(
						/Lista de  \((\d+) registros - 1 a 50\):/
					);
					if (!match) {
						throw new Error('Descrição do número de elementos desconhecida.');
					}
					caption.textContent = `Lista de ${match[1]} registros:`;
					return Promise.all([
						self.query<HTMLDivElement>('#divInfraAreaPaginacaoSuperior'),
						self.query<HTMLDivElement>('#divInfraAreaPaginacaoInferior'),
					]);
				})
				.then(divs => {
					divs.forEach(div => {
						div.style.display = 'none';
					});
					botao.style.display = 'none';
				});
		})().then(
			x => console.log('Resultado:', x),
			e => {
				botao.textContent = originalText;
				console.error(e);
			}
		);
	}

	onBotaoOrdenarClicked(evt: Event) {
		evt.preventDefault();
		const lupas = this.queryAll<HTMLImageElement>(
			'img[src$="/infra_css/imagens/lupa.gif"]'
		);
		const links = lupas
			.map(lupa => lupa.parentElement)
			.filter(
				(link): link is HTMLAnchorElement =>
					link !== null && link.matches('a[href]')
			);
		const linkTemporario = this.doc.createElement('a');
		const botao = <HTMLButtonElement>evt.target;
		const oldText = botao.textContent;
		let porcentagem = 0;
		const step = 1 / links.length;
		limitConcurrency(
			4,
			link =>
				Promise.resolve(link.getAttribute('onclick') || '')
					.then<RegExpMatchArray>(
						codigo =>
							codigo.match(/window\.open\('([^']+)'/) ||
							Promise.reject('Link desconhecido')
					)
					.then(match => {
						linkTemporario.href = match[1];
						return linkTemporario.href;
					})
					.then(
						url =>
							new Promise<string>((res, rej) => {
								botao.textContent = `Carregando dados... ${porcentagem.toLocaleString(
									'pt-BR',
									{ style: 'percent' }
								)}`;
								const xhr = new XMLHttpRequest();
								xhr.open('GET', url);
								xhr.addEventListener('load', () => {
									res(xhr.responseText);
								});
								xhr.addEventListener('error', rej);
								xhr.send(null);
							})
					)
					.then(
						html =>
							html.match(
								/<td><span class="titBold">Data do trânsito em julgado da sentença ou acórdão\(JEF\):<\/span> (\d{2}\/\d{2}\/\d{4})<\/td>/
							) ||
							(console.log('Texto não encontrado:', html),
							Promise.reject<RegExpMatchArray>(
								new Error('Texto não encontrado')
							))
					)
					.then(match => match[1])
					.then(ConversorData.analisar)
					.then(data => {
						porcentagem += step;
						botao.textContent = `Carregando dados... ${porcentagem.toLocaleString(
							'pt-BR',
							{ style: 'percent' }
						)}`;
						return data;
					}),
			links
		)
			.then(datas =>
				Promise.all(
					links.map(async (link, i) => {
						link.style.background = 'red;';
						const linha = await queryParent<HTMLTableRowElement>(link, 'tr');
						const celula = linha.cells[0];
						celula.appendChild(
							this.doc.createTextNode(
								datas[i].toLocaleDateString('pt-BR', {
									day: 'numeric',
									month: 'numeric',
									year: '2-digit',
								})
							)
						);
						return { linha, data: datas[i] };
					})
				)
			)
			.then(async infos => {
				if (infos.length === 0) return infos;
				const tabela = await queryParent<HTMLTableElement>(
					<any>infos[0].linha,
					'table'
				);
				infos.sort((a, b) => {
					const dataA = a.data;
					const dataB = b.data;
					return dataA < dataB ? -1 : dataA > dataB ? 1 : 0;
				});
				const frag = this.doc.createDocumentFragment();
				infos.forEach(({ linha }) => {
					frag.appendChild(linha);
				});
				tabela.appendChild(frag);
			})
			.then(
				x => {
					botao.textContent = oldText;
					console.log('Resultado:', x);
				},
				e => {
					botao.textContent = oldText;
					console.error(e);
				}
			);
	}
}

function limitConcurrency<T, U>(
	max: number,
	mapper: (_: T) => Promise<U>,
	originalItems: T[]
) {
	const items = originalItems.slice();
	return new Promise<U[]>((res, rej) => {
		const promises: Promise<void | U>[] = [];
		let rejected = false;
		let running = 0;
		const doLoop = () => {
			if (rejected) return;
			if (running >= max) return;
			if (items.length) {
				const item = <T>items.shift();
				promises.push(
					mapper(item).then(
						x => {
							running--;
							setImmediate(doLoop);
							return x;
						},
						e => {
							if (!rejected) {
								rejected = true;
								rej(e);
							}
						}
					)
				);
				running++;
				setImmediate(doLoop);
			} else {
				res(Promise.all(<Promise<U>[]>promises));
			}
		};
		doLoop();
	});
}

function queryParent<T extends HTMLElement>(element: Node, selector: string) {
	let parent = element.parentElement;
	while (parent !== null) {
		if (parent.matches(selector)) return Promise.resolve(<T>parent);
		parent = parent.parentElement;
	}
	return Promise.reject(new Error('Ancestral não encontrado.'));
}
