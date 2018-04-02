import Acoes from './Acoes';
import { RequisicaoListar } from './Requisicao/RequisicaoListar';
// ABRIR_DOCUMENTO = 'abrirDocumento',
// ABRIR_REQUISICAO = 'abrirRequisicao',
// BUSCAR_DADOS = 'buscarDados',
// EDITAR_REQUISICAO_ANTIGA = 'editarRequisicaoAntiga',
// EDITAR_REQUISICAO = 'editarRequisicao',
// ORDEM_CONFIRMADA = 'ordemConfirmada',
// PREPARAR_INTIMACAO_ANTIGA = 'prepararIntimacaoAntiga',
// REQUISICAO_ANTIGA_PREPARADA = 'requisicaoAntigaPreparada',
// RESPOSTA_DADOS = 'respostaDados',
// RESPOSTA_JANELA_ABERTA = 'respostaJanelaAberta',
// VERIFICAR_JANELA = 'verificarJanela',

interface MensagemAbrirRequisicao {
	acao: Acoes.ABRIR_REQUISICAO;
	requisicao: RequisicaoListar;
}

interface MensagemVerificarJanela {
	acao: Acoes.VERIFICAR_JANELA;
}

type Mensagem = MensagemAbrirRequisicao | MensagemVerificarJanela;
export default Mensagem;
