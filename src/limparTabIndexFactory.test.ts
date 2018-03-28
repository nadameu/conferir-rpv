import limparTabIndexFactory from './limparTabIndexFactory';

describe('limparTabIndexFactory', () => {
	it('Altera o atributo tabIndex de todos os elementos para 0', () => {
		const fakeDoc = { querySelectorAll: jest.fn() };
		const elementos = [1, 2, 3, 4].map(tabIndex => ({ tabIndex }));
		fakeDoc.querySelectorAll.mockReturnValue(elementos);
		const limparTabIndex = limparTabIndexFactory((fakeDoc as any) as Document);
		limparTabIndex();
		expect(elementos.every(({ tabIndex }) => tabIndex === 0)).toBe(true);
	});
});
