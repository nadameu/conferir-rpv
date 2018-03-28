import Pagina from './Pagina';

export default class PaginaRedirecionamento extends Pagina {
	get urlRedirecionamento() {
		const match = this.doc.documentElement.innerHTML.match(
			/window\.location = '([^']+)';/
		);
		if (match) {
			return match[1];
		}
		throw new Error('Não é uma página de redirecionamento.');
	}
}
