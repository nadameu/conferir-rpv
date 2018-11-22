import jsc from 'jsverify';
import ConversorMesAno from './ConversorMesAno';
test('analisar e converter', () => {
	jsc.assertForall(
		jsc.datetime.smap(t => new Date(t.getFullYear(), t.getMonth()), t => t),
		date => {
			return (
				ConversorMesAno.analisar(ConversorMesAno.converter(date)).getTime() ===
				date.getTime()
			);
		}
	);
});
