import jsc from 'jsverify';
import ConversorValores from './ConversorValores';
import ConversorMoeda from './ConversorMoeda';

test('analisar', () => {
	jsc.assertForall(
		jsc.suchthat(jsc.number, x => x >= 0),
		jsc.suchthat(jsc.number, x => x >= 0),
		(principal, juros) => {
			const total = principal + juros;
			const analisado = ConversorValores.analisar(valoresParaTexto(principal, juros, total));
			return (
				analisado.principal === Math.round(principal * 100) / 100 &&
				analisado.juros === Math.round(juros * 100) / 100 &&
				analisado.total === Math.round(total * 100) / 100
			);
		}
	);
});

test('converter', () => {
	jsc.assertForall(
		jsc.number,
		jsc.number,
		(principal, juros) =>
			ConversorValores.converter({
				principal,
				juros,
				total: principal + juros,
			}) === valoresParaTexto(principal, juros, principal + juros)
	);
});

function valoresParaTexto(principal: number, juros: number, total: number) {
	return `${ConversorMoeda.converter(total)} (${ConversorMoeda.converter(
		principal
	)} + ${ConversorMoeda.converter(juros)})`;
}
