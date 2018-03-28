export default class Padrao {
	regularExpression: RegExp;
	properties: string[];

	constructor(re, ...props) {
		this.regularExpression = re;
		this.properties = props;
	}

	match(texto) {
		const obj = {};
		this.matchInto(texto, obj);
		return obj;
	}

	matchInto(texto, obj) {
		const changed = {};
		const match = texto.match(this.regularExpression);
		if (match) {
			const valores = match.slice(1);
			this.properties.forEach((nome, indice) => {
				let valor = valores[indice];
				changed[nome] = valor;
			});
			Object.assign(obj, changed);
			return changed;
		}
		return null;
	}
}
