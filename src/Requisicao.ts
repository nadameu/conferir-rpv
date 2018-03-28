class Requisicao {
	especie: string;
	beneficiarios = [];
	honorarios = [];

	get isPrecatorio() {
		return this.especie.match(/^Precatório/) !== null;
	}
}
