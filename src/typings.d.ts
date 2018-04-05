interface Analisadores {
	[nome: string]: Analisador<any>;
}

interface EventoI {
	data: Date;
	descricao: string;
	documentos: Documento[] | Map<number, Documento>;
	evento: number;
}

interface DadosEvento extends EventoI {
	documentos: Documento[];
}

interface DadosProcesso {
	calculos: DadosEvento[];
	contratos: DadosEvento[];
	honorarios: DadosEvento[];
	justicaGratuita: string;
	sentencas: DadosEvento[];
}

interface Documento {
	nome: string;
	ordem: number;
	tipo: string;
}

interface Evento extends EventoI {
	documentos: Map<number, Documento>;
}
