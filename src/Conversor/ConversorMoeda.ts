import AnalisadorConversor from './Conversor';
import * as Utils from '../Utils';

const ConversorMoeda: AnalisadorConversor<number> = {
	analisar(texto) {
		return parseFloat(texto.replace(/\./g, '').replace(/,/, '.'));
	},
	converter(valor) {
		let valorArredondado = Utils.round(valor, 2);
		let reais = Math.floor(valorArredondado).toLocaleString();
		let centavos = Math.round((valorArredondado * 100) % 100).toString();
		if (centavos.length < 2) centavos = `0${centavos}`;
		return `${reais},${centavos}`;
	},
};

export default ConversorMoeda;
