import Pagina from './Pagina';
import safePipe from '../Utils/safePipe';

export default class PaginaRedirecionamento extends Pagina {
	async adicionarAlteracoes() {}

	async getUrlRedirecionamento() {
		const match = safePipe(
			this.doc.documentElement,
			x => x.innerHTML,
			x => x.match(/window\.location = '([^']+)';/)
		);
		if (match) {
			return match[1];
		}
		throw new Error('Não é uma página de redirecionamento.');
	}
}
