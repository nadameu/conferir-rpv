const ConversorMoeda: AnalisadorConversor<number> = {
	analisar(texto) {
		return parseFloat(texto.replace(/\./g, '').replace(/,/, '.'));
	},
	converter(valor) {
		return valor
			.toLocaleString('en-US', {
				useGrouping: true,
				minimumIntegerDigits: 1,
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
			.replace('.', 'VIRGULA')
			.replace(/,/g, '.')
			.replace('VIRGULA', ',');
	},
};

export default ConversorMoeda;
