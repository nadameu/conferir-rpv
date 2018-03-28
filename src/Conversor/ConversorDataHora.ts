import AnalisadorConversor from './Conversor';
import * as Utils from '../Utils';

const ConversorDataHora: AnalisadorConversor<Date> = {
	analisar(texto) {
		let [d, m, y, h, i, s] = texto
			.match(/^(\d\d)\/(\d\d)\/(\d\d\d\d) (\d\d):(\d\d):(\d\d)$/)
			.slice(1);
		return new Date(
			Utils.parseDecimalInt(y),
			Utils.parseDecimalInt(m) - 1,
			Utils.parseDecimalInt(d),
			Utils.parseDecimalInt(h),
			Utils.parseDecimalInt(i),
			Utils.parseDecimalInt(s)
		);
	},

	converter(valor) {
		return valor.toLocaleString();
	},
};

export default ConversorDataHora;
