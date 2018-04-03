import Acoes from '../Acoes';
import BotaoAcao from '../BotaoAcao';
import Mensagem from '../Mensagem';
import Pagina from './Pagina';
import { RequisicaoListar } from '../Requisicao/RequisicaoListar';
import parseDecimalInt from '../Utils/parseDecimalInt';

const erroParaArray = <T>(logar = false) => (erro: any) => {
	if (logar) console.error(erro);
	return [] as T[];
};

const descartarRejeicoes = <T>(promises: Promise<T>[], logar = false) =>
	Promise.all(
		promises.map(promise => promise.then(x => [x], erroParaArray<T>(logar)))
	).then(xss => xss.flatten());

const promiseIndex = <T>(index: number) => (collection: {
	length: number;
	[index: number]: T | undefined;
}) =>
	collection.length > index && collection[index] !== undefined
		? Promise.resolve(collection[index] as T)
		: Promise.reject(new Error(`Índice inexistente: ${index}.`));

const promiseTexto = (elemento: Element) => {
	const texto = elemento.textContent;
	return texto
		? Promise.resolve(texto)
		: Promise.reject(new Error(`Elemento não possui texto: ${elemento}`));
};

const obterCelulaLinha = (linha: HTMLTableRowElement, index: number) =>
	Promise.resolve(linha.cells as HTMLCollectionOf<HTMLTableCellElement>).then(
		promiseIndex(index)
	);

const obterElems = <T extends Element>(
	linha: HTMLTableRowElement,
	index: number,
	selector: string
) =>
	obterCelulaLinha(linha, index)
		.then(celula => celula.querySelectorAll<T>(selector))
		.then(collection => Array.from(collection));

const obterNumero = (linha: HTMLTableRowElement, index: number) =>
	obterTexto(linha, index).then(parseDecimalInt);

const obterTexto = (linha: HTMLTableRowElement, index: number) =>
	obterCelulaLinha(linha, index)
		.then(promiseTexto)
		.then(x => x.trim());

const makeObterHref = (urls: URL[]) => (param: string, expected?: string) => {
	const filtradas = urls.filter(
		url => url.searchParams.get(param) === expected
	);
	return filtradas.length === 0
		? Promise.reject(
				new Error(
					`Não há URL com o parâmetro "${param}" igual a "${expected}".`
				)
		  )
		: Promise.resolve(filtradas[0].href);
};

export default class PaginaListar extends Pagina {
	constructor(doc: Document) {
		super(doc);
	}

	async adicionarAlteracoes() {
		const win = this.doc.defaultView;
		const opener = win.opener;
		await this.testarJanelaProcessoAberta();
		const requisicoes = await this.obterRequisicoes();
		return Promise.all(
			requisicoes.map(async requisicao => {
				const celula = await obterCelulaLinha(requisicao.linha, 2);
				const botao = BotaoAcao.criar('Verificar dados', evt => {
					evt.preventDefault();
					evt.stopPropagation();
					this.solicitarAberturaRequisicao(opener, requisicao);
				});
				celula.appendChild(this.doc.createTextNode(' '));
				celula.appendChild(botao);
				return requisicao.numero;
			})
		)
			.then(xs => xs.join(', '))
			.then(ns => `Adicionado(s) botão(ões) à(s) requisição(ões) ${ns}.`);
	}

	async obterRequisicao(linha: HTMLTableRowElement): Promise<RequisicaoListar> {
		const numero = await obterNumero(linha, 0);
		const status = await obterTexto(linha, 1);
		const links = await obterElems<HTMLAnchorElement>(linha, 2, 'a[href]');
		const urls = links.map(link => new URL(link.href));
		const obterHref = makeObterHref(urls);
		const req: RequisicaoListar = {
			linha,
			numero,
			status,
			...(urls.every(url => url.searchParams.has('numRequis'))
				? {
						tipo: 'antiga',
						urlConsultarAntiga: await obterHref('strAcao', undefined),
						urlEditarAntiga: await obterHref('strAcao', 'editar'),
				  }
				: {
						tipo: 'nova',
						urlConsultar: await obterHref(
							'acao',
							'oficio_requisitorio_visualizar'
						),
						urlEditar: await obterHref(
							'acao',
							'oficio_requisitorio_requisicoes_editar'
						),
				  }),
		};
		return req;
	}

	async obterRequisicoes() {
		const linhas = this.queryAll<HTMLTableRowElement>(
			'#divInfraAreaTabela > table tr[class^="infraTr"]'
		);
		return descartarRejeicoes(linhas.map(this.obterRequisicao), true);
	}

	solicitarAberturaRequisicao(janela: Window, requisicao: RequisicaoListar) {
		const data: Mensagem = {
			acao: Acoes.ABRIR_REQUISICAO,
			requisicao: requisicao,
		};
		janela.postMessage(JSON.stringify(data), this.doc.location.origin);
	}

	async testarJanelaProcessoAberta() {
		const win = this.doc.defaultView;
		const opener: Window | null = win.opener;

		if (!opener || opener === win) {
			throw new Error('Janela do processo não está aberta.');
		}

		const demorouDemais = new Promise<never>((_, rej) => {
			setTimeout(
				() => rej(new Error('Janela do processo não respondeu.')),
				3000
			);
		});

		const aguardarMensagem = new Promise<boolean>((res, rej) => {
			win.addEventListener(
				'message',
				({ origin, data }) => {
					if (origin === this.doc.location.origin) {
						const { acao } = JSON.parse(data);
						if (acao === Acoes.RESPOSTA_JANELA_ABERTA) {
							return res(true);
						}
					}
					rej(
						new Error(`Janela do processo não encontrada. ${origin}, ${data}`)
					);
				},
				{ once: true }
			);
		});

		const data: Mensagem = {
			acao: Acoes.VERIFICAR_JANELA,
		};
		opener.postMessage(JSON.stringify(data), this.doc.location.origin);

		return Promise.race([aguardarMensagem, demorouDemais]);
	}
}
