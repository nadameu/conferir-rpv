import obterElementosFactory from './obterElementosFactory';

interface Elementos {
	[id: string]: {} | null;
}

const makeFakeDoc = (elementos: Elementos) => ({
	getElementById(id: string) {
		return elementos[id];
	},
});

describe('obterElementosFactory', () => {
	it('Funciona se todos os elementos existirem', done => {
		const elementos: Elementos = { a: {}, b: {}, c: {} };
		const ids = Object.keys(elementos);
		const elementosAsArray = ids.map(id => elementos[id]);

		const fakeDoc = makeFakeDoc(elementos);
		const obterElementos = obterElementosFactory(fakeDoc as any);

		return obterElementos(ids).then(els => {
			expect(els).toEqual(elementosAsArray);
			done();
		});
	});

	it('Falha se algum elemento não existir', done => {
		const elementos: Elementos = { a: {}, b: null, c: null, d: {} };
		const ids = Object.keys(elementos);
		const primeiroIdNulo = ids.reduce(
			(acc: string | null, id) =>
				acc === null && elementos[id] === null ? id : acc,
			null
		);

		const fakeDoc = makeFakeDoc(elementos);
		const obterElementos = obterElementosFactory(fakeDoc as any);

		return obterElementos(ids).catch(e => {
			expect(e).toEqual(primeiroIdNulo);
			done();
		});
	});
});
