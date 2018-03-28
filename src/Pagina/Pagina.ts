export default abstract class Pagina implements PaginaComAlteracoes {
	doc: Document;
	constructor(doc: Document) {
		this.doc = doc;
	}

	abstract adicionarAlteracoes(): void;

	validarElemento(
		selector: string,
		condicao?: boolean,
		classeTrue = 'gm-resposta--correta',
		classeFalse = 'gm-resposta--incorreta',
		classeUndefined = 'gm-resposta--indefinida'
	) {
		const elemento = this.doc.querySelector(selector);
		if (! elemento) throw new Error(`Elemento não encontrado: ${selector}`);
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
