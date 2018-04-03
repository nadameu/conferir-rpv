interface RequisicaoListarBase {
	readonly linha: HTMLTableRowElement;
	readonly numero: number;
	readonly status: string;
}

export interface RequisicaoListarAntiga extends RequisicaoListarBase {
	readonly tipo: 'antiga';
	readonly urlConsultarAntiga: string;
	readonly urlEditarAntiga: string;
}

export interface RequisicaoListarNova extends RequisicaoListarBase {
	readonly tipo: 'nova';
	readonly urlConsultar: string;
	readonly urlEditar: string;
}

export type RequisicaoListar = RequisicaoListarAntiga | RequisicaoListarNova;
