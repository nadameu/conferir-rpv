import jsc from 'jsverify';
import ConversorDataHora from './ConversorDataHora';

test('analisar', () => {
	jsc.assertForall(jsc.datetime, data => {
		const analisado = ConversorDataHora.analisar(dataParaTexto(data));
		return (
			analisado.getDate() === data.getDate() &&
			analisado.getMonth() === data.getMonth() &&
			analisado.getFullYear() === data.getFullYear() &&
			analisado.getHours() === data.getHours() &&
			analisado.getMinutes() === data.getMinutes() &&
			analisado.getSeconds() === data.getSeconds()
		);
	});
});

test('converter', () => {
	jsc.assertForall(jsc.datetime, data => ConversorDataHora.converter(data) === dataParaTexto(data));
});

function dataParaTexto(data: Date) {
	const [mes, dia, ano, , hora, minuto, segundo] = data
		.toLocaleString('en-US', {
			hour12: false,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		})
		.split(/[/, :]/g);
	const texto = [[dia, mes, ano].join('/'), [hora, minuto, segundo].join(':')].join(' ');
	return texto;
}
