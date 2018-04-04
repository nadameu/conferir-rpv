export default class Requisicao {
	especie: string;
	linha: HTMLTableRowElement;
	numero: number;
	beneficiarios = [];
	honorarios = [];

	get isPrecatorio(): boolean {
		if (this.especie === undefined) {
			throw new Error('Espécie de requisição não definida');
		}
		return this.especie.match(/^Precatório/) !== null;
	}
}
