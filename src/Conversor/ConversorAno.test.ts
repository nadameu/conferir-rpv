import jsc from 'jsverify';
import ConversorAno from './ConversorAno';

const datasValidas = jsc.suchthat(
	jsc.datetime,
	x => x.getFullYear() >= 1000 && x.getFullYear() <= 9999
);

test('analisar', () => {
	jsc.assertForall(
		datasValidas,
		data => ConversorAno.analisar(String(data.getFullYear())).getFullYear() === data.getFullYear()
	);
});

test('converter', () => {
	jsc.assertForall(
		datasValidas,
		data => ConversorAno.converter(data) === data.getFullYear().toString()
	);
});
