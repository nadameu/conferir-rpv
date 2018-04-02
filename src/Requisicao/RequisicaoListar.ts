class RequisicaoListarBase {
	constructor(
		readonly linha: HTMLTableRowElement,
		readonly numero: number,
		readonly status: string
	) {}
}

export class RequisicaoListarAntiga extends RequisicaoListarBase {
	constructor(
		linha: HTMLTableRowElement,
		numero: number,
		status: string,
		readonly urlConsultarAntiga: string,
		readonly urlEditarAntiga: string
	) {
		super(linha, numero, status);
	}
}

export class RequisicaoListarNova extends RequisicaoListarBase {
	constructor(
		linha: HTMLTableRowElement,
		numero: number,
		status: string,
		readonly urlConsultar: string,
		readonly urlEditar: string
	) {
		super(linha, numero, status);
	}
}

export type RequisicaoListar = RequisicaoListarAntiga | RequisicaoListarNova;
