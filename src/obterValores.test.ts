import { formatarMoeda } from './moeda';
import obterValores from './obterValores';

describe('obterValores', () => {
	it('Obtém valores', () => {
		const valores = [0, 0.01, 1000, 123456.78];
		const elementos = valores.map(valor => ({
			value: formatarMoeda(valor),
		}));
		expect(obterValores(elementos)).toEqual(valores);
	});
});
