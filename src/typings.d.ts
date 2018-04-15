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

type DadosBeneficiario = DadosPagamento & {
	anoCorrente: Date;
	cpfCnpj: string;
	irpf: boolean;
	mesesAnterior: number;
	mesesCorrente: number;
	pss: { semIncidencia: boolean };
	ordinal: number;
	valorAnterior: number;
	valorCorrente: number;
};

interface DadosEvento extends EventoI {
	documentos: Documento[];
}

type DadosHonorario = DadosPagamento & {
	beneficiario: string;
	tipoHonorario:
		| 'Honorários Contratuais'
		| 'Devolução à Seção Judiciária'
		| 'Honorários de Sucumbência';
};

interface DadosPagamento {
	especie: string;
	nome: string;
	codigoTipoDespesa: string;
	dataBase: Date;
	naturezaTributaria: boolean;
	renunciaValor: boolean;
	tipoJuros: string;
	valor: DadosValor;
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

interface DadosValor {
	principal: number;
	juros: number;
	total: number;
}

interface Documento {
	nome: string;
	ordem: number;
	tipo: string;
}

interface Evento extends EventoI {
	documentos: Map<number, Documento>;
}
