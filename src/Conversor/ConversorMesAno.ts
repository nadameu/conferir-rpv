import AnalisadorConversor from './Conversor';
import * as Utils from '../Utils';
import { constants } from 'fs';

const ConversorMesAno: AnalisadorConversor<Date> = {
	analisar(texto) {
		let [m, y] = texto.match(/^(\d\d)\/(\d\d\d\d)$/).slice(1);
		return new Date(Utils.parseDecimalInt(y), Utils.parseDecimalInt(m) - 1, 1);
	},
	converter(valor) {
		const mes = valor.getMonth() + 1;
		let strMes = mes.toString();
		if (mes < 10) {
			strMes = `0${strMes}`;
		}
		let y = valor.getFullYear();
		return `${strMes}/${y}`;
	},
};

export default ConversorMesAno;
