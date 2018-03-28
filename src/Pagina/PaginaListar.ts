import BotaoAcao from '../BotaoAcao';
import Pagina from './Pagina';

export default class PaginaListar extends Pagina {
	constructor(doc: Document) {
		super(doc);
	}
	get requisicoes() {
		const linhas = Array.from(
			this.doc.querySelectorAll(
				'#divInfraAreaTabela > table tr[class^="infraTr"]'
			)
		);
		return linhas.map(linha => {
			const requisicao = new Requisicao();
			requisicao.linha = linha;
			requisicao.numero = Utils.parseDecimalInt(
				linha.cells[0].textContent.trim()
			);
			requisicao.status = linha.cells[1].textContent.trim();
			const links = Array.from(linha.cells[2].querySelectorAll('a[href]'));
			links.filter(link => link.href.match(/&numRequis=\d+$/)).forEach(link => {
				requisicao.tipo = 'antiga';
				requisicao.urlConsultarAntiga = link.href;
			});
			links
				.filter(link => link.href.match(/&numRequis=\d+&strAcao=editar$/))
				.forEach(link => {
					requisicao.tipo = 'antiga';
					requisicao.urlEditarAntiga = link.href;
				});
			links
				.filter(link =>
					link.href.match(/\?acao=oficio_requisitorio_visualizar&/)
				)
				.forEach(link => {
					requisicao.tipo = 'nova';
					requisicao.urlConsultar = link.href;
				});
			links
				.filter(link =>
					link.href.match(/\?acao=oficio_requisitorio_requisicoes_editar&/)
				)
				.forEach(link => {
					requisicao.tipo = 'nova';
					requisicao.urlEditar = link.href;
				});
			return requisicao;
		});
	}

	adicionarAlteracoes() {
		const win = this.doc.defaultView;
		const opener = win.opener;
		this.testarJanelaProcessoAberta().then(() => {
			this.requisicoes.forEach(requisicao => {
				const botao = BotaoAcao.criar('Verificar dados', evt => {
					evt.preventDefault();
					evt.stopPropagation();
					this.solicitarAberturaRequisicao(opener, requisicao);
				});
				requisicao.linha.cells[2].appendChild(this.doc.createTextNode(' '));
				requisicao.linha.cells[2].appendChild(botao);
			});
		});
	}

	solicitarAberturaRequisicao(janela, requisicao) {
		const data = {
			acao: Acoes.ABRIR_REQUISICAO,
			requisicao: requisicao,
		};
		janela.postMessage(JSON.stringify(data), this.doc.location.origin);
	}

	testarJanelaProcessoAberta() {
		const win = this.doc.defaultView;
		const opener = win.opener;
		if (opener && opener !== win) {
			const self = this;
			const promise = new Promise(resolve => {
				win.addEventListener('message', function handler(evt) {
					win.removeEventListener('message', handler);
					if (evt.origin === self.doc.location.origin) {
						const data = JSON.parse(evt.data);
						if (data.acao === Acoes.RESPOSTA_JANELA_ABERTA) {
							resolve();
						}
					}
				});
			});
			const data = {
				acao: Acoes.VERIFICAR_JANELA,
			};
			opener.postMessage(JSON.stringify(data), this.doc.location.origin);
			return promise;
		}
		return Promise.reject();
	}
}
