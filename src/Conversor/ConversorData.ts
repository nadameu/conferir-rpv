import parseDecimalInt from '../Utils/parseDecimalInt';

const ConversorData: AnalisadorConversor<Date> = {
	analisar(texto) {
		const match = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (!match || match.length !== 4) {
			throw new TypeError(`Valor não corresponde a uma data: "${texto}".`);
		}
		let [, d, m, y] = match;
		return new Date(
			parseDecimalInt(y),
			parseDecimalInt(m) - 1,
			parseDecimalInt(d)
		);
	},
	converter(valor) {
		const [ano, mes, dia] = [
			valor.getFullYear(),
			valor.getMonth() + 1,
			valor.getDate(),
		]
			.map(String)
			.map(x => x.padStart(2, '0'));
		return `${dia}/${mes}/${ano}`;
	},
};

export default ConversorData;
