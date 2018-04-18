import BotaoAcao from '../BotaoAcao';
import Pagina from './Pagina';
import { ConversorData } from '../Conversor';

type DadosPaginacao = {
	tabela: HTMLTableElement;
	caption: HTMLTableCaptionElement;
	registros: number;
	form: HTMLFormElement;
	paginacao: HTMLSelectElement;
	paginacaoSuperior: HTMLDivElement;
	paginacaoInferior: HTMLDivElement;
	paginaAtual: HTMLInputElement;
};

export default class PaginaOficioRequisitorioListar extends Pagina {
	private _isLoadingPages = false;
	private _isLoadingDates = false;

	async adicionarAlteracoes() {
		const barra = await this.query<HTMLDivElement>(
			'#divInfraBarraComandosSuperior'
		);
		const fragment = this.doc.createDocumentFragment();
		await this.adicionarBotaoCarregarPaginas().then(
			botaoCarregarPaginas => {
				fragment.appendChild(botaoCarregarPaginas);
				botaoCarregarPaginas.insertAdjacentHTML('afterend', '&nbsp;\n');
			},
			err => {
				if (!(err instanceof NotFirstPageError)) throw err;
			}
		);
		const botaoOrdenar = this.adicionarBotaoOrdenar();
		fragment.appendChild(botaoOrdenar);
		botaoOrdenar.insertAdjacentHTML('afterend', '&nbsp;\n');
		barra.insertBefore(fragment, barra.firstChild);
	}

	async adicionarBotaoCarregarPaginas() {
		const dadosPaginacao = await this.obterDadosPaginacao();
		if (dadosPaginacao.paginaAtual.value !== '0') throw new NotFirstPageError();
		return BotaoAcao.criar(
			'Carregar todas as páginas',
			this.onBotaoCarregarPaginasClicked.bind(this, dadosPaginacao)
		);
	}

	adicionarBotaoOrdenar() {
		return BotaoAcao.criar(
			'Ordenar por data de trânsito',
			this.onBotaoOrdenarClicked.bind(this)
		);
	}

	async obterDadosPaginacao(): Promise<DadosPaginacao> {
		const tabela = await this.query<HTMLTableElement>(
			'#divInfraAreaTabela > table'
		);
		const caption = await this.query<HTMLTableCaptionElement>(
			'caption',
			tabela
		);
		const match = (caption.textContent || '').match(
			/Lista de  \((\d+) registros - \d+ a \d+\):/
		);
		if (!match) {
			throw new Error('Descrição do número de elementos desconhecida.');
		}

		return {
			tabela,
			caption,
			registros: Number(match[1]),
			form: await queryParent<HTMLFormElement>(tabela, 'form'),
			paginacao: await this.query<HTMLSelectElement>(
				'#selInfraPaginacaoSuperior'
			),
			paginacaoSuperior: await this.query<HTMLDivElement>(
				'#divInfraAreaPaginacaoSuperior'
			),
			paginacaoInferior: await this.query<HTMLDivElement>(
				'#divInfraAreaPaginacaoInferior'
			),
			paginaAtual: await this.query<HTMLInputElement>('#hdnInfraPaginaAtual'),
		};
	}

	onBotaoCarregarPaginasClicked(dados: DadosPaginacao, evt: Event) {
		evt.preventDefault();
		if (this._isLoadingPages) return;
		const {
			caption,
			form,
			paginacao,
			paginacaoSuperior,
			paginacaoInferior,
			registros,
			tabela,
		} = dados;
		const botao = <HTMLButtonElement>evt.target;
		const originalText = botao.textContent;
		const paginas = paginacao.options.length;
		const data = new FormData(form);
		this._isLoadingPages = true;
		return limitConcurrency(
			1,
			pagina => {
				const inicial = pagina * 50 + 1;
				const final = Math.min(registros, inicial + 49);
				botao.textContent = `Carregando ofícios ${inicial} a ${final}...`;
				data.set('hdnInfraPaginaAtual', pagina.toString());
				return buscarDados('POST', this.doc.location.href, data).then(doc =>
					Array.from(
						doc.querySelectorAll<HTMLTableRowElement>(
							'#divInfraAreaTabela > table > tbody > tr:nth-child(n + 2)'
						)
					)
				);
			},
			Array.from({ length: paginas - 1 }, (_, i) => i + 1)
		)
			.then(colecoes =>
				colecoes
					.reduce((prev, curr) => prev.concat(curr))
					.reduce((frag, linha) => {
						frag.appendChild(linha);
						return frag;
					}, this.doc.createDocumentFragment())
			)
			.then(frag => {
				tabela.appendChild(frag);
				caption.textContent = `Lista de ${registros} registros:`;
				[paginacaoSuperior, paginacaoInferior, botao].forEach(el => {
					el.style.display = 'none';
				});
			})
			.then(x => console.log('Resultado:', x), e => console.error(e))
			.then(() => {
				botao.textContent = originalText;
				this._isLoadingPages = false;
			});
	}

	onBotaoOrdenarClicked(evt: Event) {
		evt.preventDefault();
		if (this._isLoadingDates) return;
		this._isLoadingDates = true;
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
			.then(datas => {
				return Promise.all(
					links.map(async (link, i) => {
						const linha = await queryParent<HTMLTableRowElement>(link, 'tr');
						const data = datas[i];
						const celula = linha.insertCell(linha.cells.length);
						celula.textContent = data.toLocaleDateString();
						return { linha, data };
					})
				);
			})
			.then(async infos => {
				if (infos.length === 0) return infos;
				const tabela = await queryParent<HTMLTableElement>(
					<any>infos[0].linha,
					'table'
				);
				const th = this.doc.createElement('th');
				th.classList.add('infraTh');
				th.textContent = 'Trânsito';
				tabela.rows[0].appendChild(th);
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
			)
			.then(() => {
				this._isLoadingDates = false;
			});
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

class NotFirstPageError extends Error {}

function queryParent<T extends HTMLElement>(element: Node, selector: string) {
	let parent = element.parentElement;
	while (parent !== null) {
		if (parent.matches(selector)) return Promise.resolve(<T>parent);
		parent = parent.parentElement;
	}
	return Promise.reject(new Error('Ancestral não encontrado.'));
}

function buscarDados<T extends XMLHttpRequestResponseType = 'document'>(
	method: string,
	url: string,
	data: any = null,
	responseType: T = <T>'document'
) {
	return new Promise<
		T extends 'document' ? Document : T extends 'text' ? string : any
	>((res, rej) => {
		const xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.responseType = responseType;
		xhr.addEventListener('load', () => {
			res(responseType === 'text' ? xhr.responseText : xhr.response);
		});
		xhr.addEventListener('error', rej);
		xhr.send(data);
	});
}
