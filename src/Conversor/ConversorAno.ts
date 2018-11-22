import parseDecimalInt from '../Utils/parseDecimalInt';

const ConversorAno: AnalisadorConversor<Date> = {
	analisar(texto) {
		const match = texto.match(/^\d{4}$/);
		if (!match || match.length !== 1) {
			throw new TypeError(`Valor não corresponde a um ano: "${texto}".`);
		}
		return new Date(parseDecimalInt(match[0]), 0);
	},
	converter(valor) {
		return valor.getFullYear().toString();
	},
};
export default ConversorAno;
