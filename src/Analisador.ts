export default abstract class Analisador {
	conversores = {};
	prefixo = null;

	aplicarConversores(obj) {
		for (let nome in this.conversores) {
			if (!obj.hasOwnProperty(nome)) continue;
			let conversor = this.conversores[nome];
			obj[nome] = conversor.analisar(obj[nome]);
		}
	}

	definirConversores(conversores) {
		this.conversores = conversores;
	}

	analisar(algo) {
		return this.analisarInto(algo, {});
	}

	abstract analisarInto(algo, obj): typeof obj;
}
