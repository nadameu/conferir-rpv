import AnalisadorConversor from './Conversor';
import * as Utils from '../Utils';

const ConversorInt: AnalisadorConversor<number> = {
	analisar(texto) {
		return Utils.parseDecimalInt('0' + texto);
	},

	converter(valor) {
		return valor.toString();
	},
};

export default ConversorInt;
