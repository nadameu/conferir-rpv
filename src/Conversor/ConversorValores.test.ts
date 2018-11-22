import jsc from 'jsverify';
import ConversorValores from './ConversorValores';
import { deepEqual } from 'assert';
test('analisar e converter', () => {
	jsc.assertForall(
		jsc.number.smap(x => parseFloat(Math.abs(x).toFixed(2)), x => x),
		jsc.number.smap(x => parseFloat(Math.abs(x).toFixed(2)), x => x),
		(principal, juros) => {
			const total = parseFloat((principal + juros).toFixed(2));
			try {
				deepEqual(
					ConversorValores.analisar(
						ConversorValores.converter({ principal, juros, total })
					),
					{ principal, juros, total }
				);
				return true;
			} catch (_) {
				return false;
			}
		}
	);
});
