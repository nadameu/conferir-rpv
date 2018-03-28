import { arredondarMoeda, formatarMoeda, parseMoeda } from './moeda';
import preencherFormulario from './preencherFormulario';

const random = (min = 0, max = 1, f = (x: number): number => x) =>
	criarElemento(f(Math.random() * (max - min) + min));

const criarElemento = (valor: number) => ({
	value: formatarMoeda(arredondarMoeda(valor)),
	valueOf() {
		return parseMoeda(this.value);
	},
});

describe('preencherFormulario', () => {
	it('calcula o valor corretamente', () => {
		for (let i = 0; i < 100; i++) {
			const referencia = random(500, 1500);
			const total = random(0.5, 1.5, rand => rand * referencia.valueOf());
			const a = random(0.25, 0.75, rand => rand * total.valueOf());
			const b = criarElemento(total.valueOf() - a.valueOf());
			const c = criarElemento(0);
			const d = criarElemento(0);
			preencherFormulario(referencia, [a, b], [c, d]);
			const valorC = arredondarMoeda(c.valueOf());
			const valorD = arredondarMoeda(d.valueOf());
			expect(arredondarMoeda(valorC + valorD)).toBe(referencia.valueOf());
		}
	});
});
