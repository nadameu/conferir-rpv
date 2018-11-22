import jsc from 'jsverify';
import ConversorDataHora from './ConversorDataHora';
test('analisar e converter', () => {
	jsc.assertForall(
		jsc.datetime.smap(
			t =>
				new Date(
					t.getFullYear(),
					t.getMonth(),
					t.getDate(),
					t.getHours(),
					t.getMinutes(),
					t.getSeconds()
				),
			t => t
		),
		date => {
			return (
				ConversorDataHora.analisar(
					ConversorDataHora.converter(date)
				).getTime() === date.getTime()
			);
		}
	);
});
