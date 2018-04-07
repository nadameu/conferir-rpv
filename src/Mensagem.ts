import Acoes from './Acoes';
import { RequisicaoListar } from './Requisicao/RequisicaoListar';

interface MensagemAbrirDocumento {
	acao: Acoes.ABRIR_DOCUMENTO;
	evento: number;
	documento: number;
}

interface MensagemAbrirRequisicao {
	acao: Acoes.ABRIR_REQUISICAO;
	requisicao: RequisicaoListar;
}

interface MensagemBuscarDados {
	acao: Acoes.BUSCAR_DADOS;
}

interface MensagemEditarRequisicao {
	acao: Acoes.EDITAR_REQUISICAO;
	requisicao: number;
}

interface MensagemOrdemConfirmada {
	acao: Acoes.ORDEM_CONFIRMADA;
	ordem: Acoes;
	requisicao: number;
}

interface MensagemRespostaJanelaAberta {
	acao: Acoes.RESPOSTA_JANELA_ABERTA;
}

interface MensagemVerificarJanela {
	acao: Acoes.VERIFICAR_JANELA;
	requisicao: number;
}

type Mensagem =
	| MensagemAbrirDocumento
	| MensagemAbrirRequisicao
	| MensagemBuscarDados
	| MensagemEditarRequisicao
	| MensagemOrdemConfirmada
	| MensagemRespostaJanelaAberta
	| MensagemVerificarJanela
	| never;
export default Mensagem;
