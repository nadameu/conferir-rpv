import AnalisadorConversor from './Conversor';
import * as Utils from '../Utils';

const ConversorAno: AnalisadorConversor<Date> = {
	analisar(texto) {
		let [y] = texto.match(/^(\d\d\d\d)$/).slice(1);
		return new Date(Utils.parseDecimalInt(y), 0, 1);
	},
	converter(valor) {
		return valor.getFullYear().toString();
	},
};
export default ConversorAno;
