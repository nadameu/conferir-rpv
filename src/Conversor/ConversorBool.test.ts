import ConversorBool from './ConversorBool';

test('analisar', () => {
	expect(ConversorBool.analisar('Sim')).toBe(true);
	expect(ConversorBool.analisar('Não')).toBe(false);
	expect(ConversorBool.analisar('Qualquer outra coisa')).toBe(false);
});

test('ConversorBool', () => {
	expect(ConversorBool.converter(true)).toBe('Sim');
	expect(ConversorBool.converter(false)).toBe('Não');
});
