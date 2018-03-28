import Analisador from './Analisador';
import Padrao from './Padrao';

export default class AnalisadorLinhasTabela extends Analisador<
	HTMLTableElement
> {
	padroes: Padrao[];
	prefixo?: string;

	constructor(...padroes: Padrao[]) {
		super();
		this.padroes = padroes;
	}

	analisarInto(tabela: HTMLTableElement, obj: any) {
		if (this.prefixo) {
			tabela.classList.add(`${this.prefixo}__tabela`);
		}
		const changed = {};
		const linhas = Array.from(tabela.rows);
		linhas.forEach(linha => {
			const texto = linha.cells[0].innerHTML.trim();
			this.padroes.forEach(padrao => {
				const match = padrao.matchInto(texto, changed);
				if (this.prefixo && match) {
					for (let nome in match) {
						linha.classList.add(`${this.prefixo}__${nome}`);
					}
				}
			});
		});
		this.aplicarConversores(changed);
		Object.assign(obj, changed);
		return changed;
	}
}
