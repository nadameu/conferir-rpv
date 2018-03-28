import PaginaListar from './PaginaListar';
import PaginaProcesso from './PaginaProcesso';
import PaginaRequisicao from './PaginaRequisicao';

export default class Pagina {
	private static _paginas: WeakMap<Document, Pagina>;

	doc: Document;

	static get paginas(): WeakMap<Document, Pagina> {
		if (!this._paginas) {
			this._paginas = new WeakMap();
		}
		return this._paginas;
	}

	constructor(doc: Document) {
		this.doc = doc;
	}

	static analisar(doc: Document): Pagina | void {
		if (this.paginas.has(doc)) {
			return this.paginas.get(doc);
		}

		let classe: typeof Pagina | undefined = undefined;

		if (doc.domain.match(/^eproc\.(trf4|jf(pr|rs|sc))\.jus\.br$/)) {
			if (doc.location.search.match(/^\?acao=processo_selecionar&/)) {
				classe = PaginaProcesso;
			} else if (
				doc.location.search.match(/^\?acao=processo_precatorio_rpv&/)
			) {
				classe = PaginaListar;
			} else if (
				doc.location.search.match(/^\?acao=oficio_requisitorio_visualizar&/)
			) {
				classe = PaginaRequisicao;
			}
		}

		if (typeof classe !== 'undefined') {
			const pagina = new classe(doc);
			this.paginas.set(doc, pagina);
			return pagina;
		}
	}

	validarElemento(
		selector: string,
		condicao: boolean | undefined,
		classeTrue = 'gm-resposta--correta',
		classeFalse = 'gm-resposta--incorreta',
		classeUndefined = 'gm-resposta--indefinida'
	) {
		const elemento = this.doc.querySelector(selector);
		if (!elemento) throw new Error(`Elemento não encontrado: ${selector}`);
		elemento.classList.add('gm-resposta');
		if (condicao === true) {
			elemento.classList.add(classeTrue);
		} else if (condicao === false) {
			elemento.classList.add(classeFalse);
		} else if (typeof condicao === 'undefined') {
			elemento.classList.add(classeUndefined);
		}
	}
}
