import parseDecimalInt from '../Utils/parseDecimalInt';

const ConversorDataHora: AnalisadorConversor<Date> = {
	analisar(texto) {
		const match = texto.match(
			/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/
		);
		if (!match || match.length !== 7) {
			throw new TypeError(`Valor não corresponde a uma data/hora: "${texto}".`);
		}
		let [, d, m, y, h, i, s] = match;
		return new Date(
			parseDecimalInt(y),
			parseDecimalInt(m) - 1,
			parseDecimalInt(d),
			parseDecimalInt(h),
			parseDecimalInt(i),
			parseDecimalInt(s)
		);
	},

	converter(valor) {
		const [ano, mes, dia, hora, minuto, segundo] = [
			valor.getFullYear(),
			valor.getMonth() + 1,
			valor.getDate(),
			valor.getHours(),
			valor.getMinutes(),
			valor.getSeconds(),
		]
			.map(String)
			.map(x => x.padStart(2, '0'));
		return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
	},
};

export default ConversorDataHora;
