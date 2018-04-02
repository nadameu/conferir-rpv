import Acoes from '../Acoes';
import BotaoAcao from '../BotaoAcao';
import Pagina from './Pagina';
import Mensagem from '../Mensagem';
import {
	RequisicaoListar,
	RequisicaoListarAntiga,
	RequisicaoListarNova,
} from '../Requisicao/RequisicaoListar';
import parseDecimalInt from '../Utils/parseDecimalInt';

const partition = <T>(pred: (item: T) => boolean, iterable: Iterable<T>) => {
	const isTrue: T[] = [];
	const isFalse: T[] = [];
	for (const item of iterable) {
		if (pred(item)) {
			isTrue.push(item);
		} else {
			isFalse.push(item);
		}
	}
	return [isTrue, isFalse];
};

export default class PaginaListar extends Pagina {
	constructor(doc: Document) {
		super(doc);
	}

	adicionarAlteracoes() {
		const win = this.doc.defaultView;
		const opener = win.opener;
		this.testarJanelaProcessoAberta()
			.then(() => this.getRequisicoes())
			.then(requisicoes =>
				requisicoes.forEach(requisicao => {
					const botao = BotaoAcao.criar('Verificar dados', evt => {
						evt.preventDefault();
						evt.stopPropagation();
						this.solicitarAberturaRequisicao(opener, requisicao);
					});
					requisicao.linha.cells[2].appendChild(this.doc.createTextNode(' '));
					requisicao.linha.cells[2].appendChild(botao);
				})
			);
	}

	async getRequisicoes() {
		const linhas = <HTMLTableRowElement[]>Array.from(
			this.doc.querySelectorAll(
				'#divInfraAreaTabela > table tr[class^="infraTr"]'
			)
		);
		const promises = linhas.map(async linha => {
			if (linha.cells.length < 2)
				throw new Error('Linha não possui o número experado de células');

			const textoNumero = linha.cells[0].textContent || null;
			if (textoNumero === null) throw new Error('Linha não possui número');
			const numero = parseDecimalInt(textoNumero.trim());

			const textoStatus = linha.cells[1].textContent || null;
			if (textoStatus === null) throw new Error('Linha não possui status');
			const status = textoStatus.trim();

			const links = <HTMLAnchorElement[]>Array.from(
				linha.cells[2].querySelectorAll('a[href]')
			);
			if (links.length !== 2)
				throw new Error('Número de links difere do esperado');

			const urls = links.map(link => new URL(link.href));
			const tipo = urls.every(url => url.searchParams.has('numRequis'))
				? 'antiga'
				: 'nova';

			if (tipo === 'antiga') {
				const [[urlConsultarAntiga], [urlEditarAntiga]] = partition(
					url => url.searchParams.get('strAcao') === undefined,
					urls
				).map(urls => urls.map(url => url.href));
				return new RequisicaoListarAntiga(
					linha,
					numero,
					status,
					urlConsultarAntiga,
					urlEditarAntiga
				);
			} else {
				const [[urlConsultar], [urlEditar]] = partition(
					url =>
						url.searchParams.get('acao') === 'oficio_requisitorio_visualizar',
					urls
				).map(urls => urls.map(url => url.href));
				return new RequisicaoListarNova(
					linha,
					numero,
					status,
					urlConsultar,
					urlEditar
				);
			}
		});
		return await promises.reduce(
			(promiseChain, promise) =>
				promiseChain.then(arr =>
					promise.then(
						value => {
							arr.push(value);
							return arr;
						},
						err => {
							console.error(err);
							return arr;
						}
					)
				),
			Promise.resolve([] as RequisicaoListar[])
		);
	}

	solicitarAberturaRequisicao(janela: Window, requisicao: RequisicaoListar) {
		const data: Mensagem = {
			acao: Acoes.ABRIR_REQUISICAO,
			requisicao: requisicao,
		};
		janela.postMessage(JSON.stringify(data), this.doc.location.origin);
	}

	testarJanelaProcessoAberta() {
		const win = this.doc.defaultView;
		const opener: Window | null = win.opener;

		if (opener && opener !== win) {
			const self = this;
			return new Promise((resolve, reject) => {
				win.addEventListener('message', function handler(evt) {
					win.removeEventListener('message', handler);
					if (evt.origin === self.doc.location.origin) {
						const data = JSON.parse(evt.data);
						if (data.acao === Acoes.RESPOSTA_JANELA_ABERTA) {
							clearTimeout(timer);
							resolve(true);
						}
					}
				});
				const timer = setTimeout(() => {
					clearTimeout(timer);
					reject(new Error('Janela do processo não respondeu.'));
				}, 3000);
				const data: Mensagem = {
					acao: Acoes.VERIFICAR_JANELA,
				};
				opener.postMessage(JSON.stringify(data), this.doc.location.origin);
			});
		}
		return Promise.reject(new Error('Janela do processo não está aberta.'));
	}
}
