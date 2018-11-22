import jsc from 'jsverify';
import ConversorData from './ConversorData';
test('analisar e converter', () => {
	jsc.assertForall(
		jsc.datetime.smap(
			t => new Date(t.getFullYear(), t.getMonth(), t.getDate()),
			t => t
		),
		date => {
			return (
				ConversorData.analisar(ConversorData.converter(date)).getTime() ===
				date.getTime()
			);
		}
	);
});
