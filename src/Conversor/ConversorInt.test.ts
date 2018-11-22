import jsc from 'jsverify';
import ConversorInt from './ConversorInt';
test('analisar e converter', () => {
	jsc.assertForall(jsc.uint32, int => {
		return ConversorInt.analisar(ConversorInt.converter(int)) === int;
	});
});
