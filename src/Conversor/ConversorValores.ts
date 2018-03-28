import { Analisador } from './Conversor';
import ConversorMoeda from './ConversorMoeda';

const ConversorValores: Analisador<Valores> = {
	analisar(texto): Valores {
		let [total, principal, juros] = texto
			.match(/^([\d.,]+)\s+\(([\d.,]+) \+ ([\d.,]+)\)$/)
			.slice(1);
		return {
			principal: ConversorMoeda.analisar(principal),
			juros: ConversorMoeda.analisar(juros),
			total: ConversorMoeda.analisar(total),
		};
	},
};
