const ConversorPorcentagem: AnalisadorConversor<number> = {
	analisar(texto) {
		const match = texto.match(/^(-?\d+(,\d+)?)%$/);
		if (!match || match.length !== 3) {
			throw new TypeError(
				`Valor não corresponde a uma porcentagem: "${texto}".`
			);
		}
		return Math.round(parseFloat(match[1].replace(',', '.')) * 1e6) / 1e8;
	},
	converter(valor, exibir6digitos = true) {
		const dividendo = exibir6digitos ? 1e8 : 100;
		return (
			((Math.round(valor * dividendo) / dividendo) * 100)
				.toFixed(6)
				.replace('.', ',')
				.replace(/0+$/, '')
				.replace(/,$/, '') + '%'
		);
	},
};

export default ConversorPorcentagem;
