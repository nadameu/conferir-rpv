import jsc from 'jsverify';
import ConversorData from './ConversorData';

test('analisar', () => {
	jsc.assertForall(jsc.datetime, data => {
		const texto = dataParaTexto(data);
		const analisado = ConversorData.analisar(texto);
		return (
			analisado.getDate() === data.getDate() &&
			analisado.getMonth() === data.getMonth() &&
			analisado.getFullYear() === data.getFullYear()
		);
	});
});

test('converter', () => {
	jsc.assertForall(jsc.datetime, data => ConversorData.converter(data) === dataParaTexto(data));
});

function dataParaTexto(data: Date) {
	const [mes, dia, ano] = data
		.toLocaleDateString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		})
		.split('/');
	return [dia, mes, ano].join('/');
}
