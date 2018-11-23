const ConversorMoeda: AnalisadorConversor<number> = {
	analisar(texto) {
		return parseFloat(texto.replace(/\./g, '').replace(/,/, '.'));
	},
	converter(valor) {
		const valorArredondado = Math.round(valor * 100) / 100;
		let [reaisComSinal, centavos] = valorArredondado.toFixed(2).split('.');
		let [, sinal, reais] = reaisComSinal.match(/^(-?)(\d+)$/) as RegExpMatchArray;
		let final = '';
		while (reais.length > 3) {
			final = `.${reais.substr(-3)}` + final;
			reais = reais.substr(0, reais.length - 3);
		}
		return `${sinal || ''}${reais}${final},${centavos}`;
	},
};

export default ConversorMoeda;
