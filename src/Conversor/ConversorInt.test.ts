import jsc from 'jsverify';
import ConversorInt from './ConversorInt';

test('analisar', () => {
	jsc.assertForall(jsc.nat, int => ConversorInt.analisar(String(int)) === int);
});

test('converter', () => {
	jsc.assertForall(jsc.nat, int => ConversorInt.converter(int) === String(int));
});
