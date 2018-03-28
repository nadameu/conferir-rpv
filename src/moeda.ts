import isNode from 'detect-node';
import IntlPolyfill from 'intl';

if (isNode) {
	global.Intl = IntlPolyfill;
}

export function parseMoeda(texto: string) {
	return Number(
		String(texto)
			.replace(/\./g, '')
			.replace(',', '.')
	);
}

export function arredondarMoeda(valor: number) {
	return Math.round(Number(valor) * 100) / 100;
}

const formatador = Intl.NumberFormat('pt-BR', {
	style: 'decimal',
	useGrouping: true,
	minimumIntegerDigits: 1,
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function formatarMoeda(valor: number) {
	return formatador.format(valor);
}
