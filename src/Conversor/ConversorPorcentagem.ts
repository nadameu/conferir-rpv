import { Conversor } from './Conversor';
import * as Utils from '../Utils';

const ConversorPorcentagem: Conversor<number> = {
	converter(valor) {
		return Number(valor).toLocaleString('pt-BR', {
			style: 'percent',
			maximumFractionDigits: 6,
		});
	},
};
