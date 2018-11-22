import jsc from 'jsverify';
import ConversorMoeda from './ConversorMoeda';

test('analisar', () => {
	jsc.assertForall(
		jsc.number,
		num =>
			ConversorMoeda.analisar(valorParaTexto(num)) ===
			Math.round(num * 100) / 100
	);
});

test('converter', () => {
	jsc.assertForall(
		jsc.number,
		num => ConversorMoeda.converter(num) === valorParaTexto(num)
	);
});

function valorParaTexto(num: number) {
	const [reais, centavos] = num
		.toLocaleString('en-US', {
			useGrouping: true,
			minimumIntegerDigits: 1,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
		.split('.');
	const texto = `${reais.replace(/,/g, '.')},${centavos}`;
	return texto;
}
