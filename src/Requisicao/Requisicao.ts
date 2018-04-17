export default class Requisicao {
	codigoAssunto: string;
	dataAjuizamento: Date;
	dataTransitoConhecimento: string;
	dataTransitoSentenca: Date;
	especie: string;
	linha: HTMLTableRowElement;
	numero: number;
	requerido: string;
	status: string;
	valorTotalRequisitado: number;
	beneficiarios: DadosBeneficiario[] = [];
	honorarios: DadosHonorario[] = [];

	get isPrecatorio(): boolean {
		if (this.especie === undefined) {
			throw new Error('Espécie de requisição não definida');
		}
		return this.especie.match(/^Precatório/) !== null;
	}
}
