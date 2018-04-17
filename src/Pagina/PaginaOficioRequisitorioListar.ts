import BotaoAcao from '../BotaoAcao';
import Pagina from './Pagina';
import { Resolve } from 'webpack';
import { ConversorData } from '../Conversor';

export default class PaginaOficioRequisitorioListar extends Pagina {
	async adicionarAlteracoes() {
		const barra = await this.query<HTMLDivElement>(
			'#divInfraBarraComandosSuperior'
		);

		const botaoOrdenarPorTransito = BotaoAcao.criar(
			'Ordenar por data de trânsito',
			this.onBotaoOrdenarClicked.bind(this)
		);

		const fragment = this.doc.createDocumentFragment();
		fragment.appendChild(botaoOrdenarPorTransito);
		botaoOrdenarPorTransito.insertAdjacentHTML('afterend', '&nbsp;\n');
		barra.insertBefore(fragment, barra.firstChild);
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
		const urls = links
			.map(link => link.getAttribute('onclick') || '')
			.map(codigo => codigo.match(/window\.open\('([^']+)'/))
			.filter((x): x is RegExpMatchArray => x !== null)
			.map(match => match[1])
			.map(texto => {
				linkTemporario.href = texto;
				return linkTemporario.href;
			});
		const promiseThunks = urls.map(url => () =>
			new Promise<string>((res, rej) => {
				const xhr = new XMLHttpRequest();
				xhr.open('GET', url);
				xhr.addEventListener('load', () => {
					res(xhr.responseText);
				});
				xhr.addEventListener('error', rej);
				xhr.send(null);
			})
		);
		console.log(promiseThunks.length);
		limitConcurrency(4, promiseThunks)
			.then(textos =>
				textos
					.map(
						texto =>
							texto.match(
								/<td><span class="titBold">Data do trânsito em julgado da sentença ou acórdão\(JEF\):<\/span> (\d{2}\/\d{2}\/\d{4})<\/td>/
							) || (console.log(texto), null)
					)
					.filter((x): x is RegExpMatchArray => x !== null)
					.map(x => x[1])
					.map(ConversorData.analisar)
			)
			.then(x => console.log('Resultado:', x), e => console.error(e));
	}
}

type Resolved<T> = { status: 'resolved'; value: T };
type Rejected = { status: 'rejected'; error: any };
type Pending = { status: 'pending' };
type Result<T> = Pending | Resolved<T> | Rejected;

function limitConcurrency<T>(max: number, thunks: (() => Promise<T>)[]) {
	return new Promise<T[]>((res, rej) => {
		const resultados: Result<T>[] = new Array(thunks.length).map(
			() =>
				<Pending>{
					status: 'pending',
				}
		);
		let rejected = false;
		let running = 0;
		let index = -1;
		const doLoop = () => {
			while (!rejected && ++index < thunks.length && running < max) {
				const i = index;
				thunks[index]().then(
					x => {
						resultados[i] = { status: 'resolved', value: x };
						running--;
						doLoop();
					},
					e => {
						if (!rejected) {
							rejected = true;
							rej(e);
						}
					}
				);
				running++;
			}
			if (running === 0 && resultados.every(r => r.status === 'resolved')) {
				res((resultados as Resolved<T>[]).map(r => r.value));
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
