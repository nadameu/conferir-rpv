import jsc from 'jsverify';
import ConversorPorcentagem from './ConversorPorcentagem';
test('analisar e converter', () => {
	jsc.assertForall(
		jsc.number.smap(x => Math.round(x * 1e8) / 1e8, x => x),
		num => {
			return (
				ConversorPorcentagem.analisar(ConversorPorcentagem.converter(num)) ===
				num
			);
		}
	);
});
