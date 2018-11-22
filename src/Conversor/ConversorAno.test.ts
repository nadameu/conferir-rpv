import jsc from 'jsverify';
import ConversorAno from './ConversorAno';
test('analisar e converter', () => {
	jsc.assertForall(jsc.datetime, origDate => {
		const date = new Date(origDate.getFullYear(), 0, 1);
		return (
			ConversorAno.analisar(ConversorAno.converter(date)).getTime() ===
			date.getTime()
		);
	});
});
