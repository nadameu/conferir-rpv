import AnalisadorConversor from './Conversor';
import * as Utils from '../Utils';

const ConversorData: AnalisadorConversor<Date> = {
	analisar(texto) {
		let [d, m, y] = texto.match(/^(\d\d)\/(\d\d)\/(\d\d\d\d)$/).slice(1);
		return new Date(
			Utils.parseDecimalInt(y),
			Utils.parseDecimalInt(m) - 1,
			Utils.parseDecimalInt(d)
		);
	},
	converter(valor) {
		return valor.toLocaleDateString();
	},
};

export default ConversorData;
