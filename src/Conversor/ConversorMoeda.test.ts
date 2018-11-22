import jsc from 'jsverify';
import ConversorMoeda from './ConversorMoeda';
test('analisar e converter', () => {
	jsc.assertForall(jsc.uint32.smap(x => x / 100, x => x * 100), date => {
		return ConversorMoeda.analisar(ConversorMoeda.converter(date)) === date;
	});
});
