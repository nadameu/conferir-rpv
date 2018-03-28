export default abstract class Analisador<T> {
	conversores: Analisadores = {};

	aplicarConversores(obj: { [nome: string]: string }) {
		for (let nome in this.conversores) {
			if (! obj.hasOwnProperty(nome)) continue;
			let conversor = this.conversores[nome];
			obj[nome] = conversor.analisar(obj[nome]);
		}
	}

	definirConversores(conversores: Analisadores) {
		this.conversores = conversores;
	}

	analisar(algo: T) {
		return this.analisarInto(algo, {});
	}

	abstract analisarInto(algo: T, obj: any): typeof obj;
}
