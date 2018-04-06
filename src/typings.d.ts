interface Analisadores {
	[nome: string]: Analisador<any>;
}

interface EventoI {
	data: Date;
	descricao: string;
	documentos: Documento[] | Map<number, Documento>;
	evento: number;
}

interface DadosAutor {
	nome: string;
	cpfCnpj: string;
	advogados: string[];
}

interface DadosEvento extends EventoI {
	documentos: Documento[];
}

interface DadosProcesso {
	assuntos: string[];
	autores: DadosAutor[];
	autuacao: Date;
	calculos: DadosEvento[];
	contratos: DadosEvento[];
	honorarios: DadosEvento[];
	justicaGratuita: string;
	magistrado: string;
	reus: string[];
	sentencas: DadosEvento[];
	transito: DadosTransito;
}

interface DadosTransito {
	dataTransito?: Date;
	dataEvento?: Date;
	dataDecurso?: Date;
	dataFechamento?: Date;
}

interface Documento {
	nome: string;
	ordem: number;
	tipo: string;
}

interface Evento extends EventoI {
	documentos: Map<number, Documento>;
}
