import jsc from 'jsverify';
import ConversorMesAno from './ConversorMesAno';

test('analisar', () => {
	jsc.assertForall(jsc.datetime, data => {
		const analisado = ConversorMesAno.analisar(dataParaTexto(data));
		return (
			analisado.getMonth() === data.getMonth() && analisado.getFullYear() === data.getFullYear()
		);
	});
});

test('converter', () => {
	jsc.assertForall(jsc.datetime, data => ConversorMesAno.converter(data) === dataParaTexto(data));
});

function dataParaTexto(data: Date) {
	return data.toLocaleString('en-US', {
		year: 'numeric',
		month: '2-digit',
	});
}
