import jsc from 'jsverify';
import ConversorPorcentagem from './ConversorPorcentagem';

test('analisar', () => {
	jsc.assertForall(jsc.number, num => {
		const texto = valorParaTexto(num);
		return ConversorPorcentagem.analisar(texto) === Math.round(num * 1e8) / 1e8;
	});
});

test('converter', () => {
	jsc.assertForall(
		jsc.number,
		num => ConversorPorcentagem.converter(num) === valorParaTexto(num)
	);
});

function valorParaTexto(num: number) {
	return num
		.toLocaleString('en-US', {
			style: 'percent',
			useGrouping: false,
			maximumFractionDigits: 6,
		})
		.replace('.', ',');
}
