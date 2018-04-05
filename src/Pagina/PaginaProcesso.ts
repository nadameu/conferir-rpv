import './PaginaProcesso.scss';
import Acoes from '../Acoes';
import BotaoAcao from '../BotaoAcao';
import { ConversorData, ConversorDataHora } from '../Conversor';
import Pagina from './Pagina';
import { PaginaListar, PaginaRedirecionamento } from './index';
import * as Utils from '../Utils';
import { lefts, rights } from '../Utils/promises';
import * as XHR from '../XHR';
import { RequisicaoListarAntiga, RequisicaoListarNova } from '../Requisicao';

export default class PaginaProcesso extends Pagina {
	private fecharAposPreparar = new Set();
	private janelasDependentes: Map<string, Window> = new Map();
	urlEditarRequisicoes: Map<number, string> = new Map();

	async obterAssuntos() {
		const tabela = await this.query<HTMLTableElement>(
			'table[summary="Assuntos"]'
		);
		return Array.from(tabela.rows)
			.filter((_, i) => i > 0)
			.flatMap(linha =>
				maybe(Utils.safePipe(linha.cells[0], c => c.textContent))
			);
	}

	obterAutores() {
		const links = this.queryAll<HTMLAnchorElement>('a[data-parte="AUTOR"]');
		const autores = links.map(async link => {
			const nome = await promiseText(link);
			const celula = await promiseParent<HTMLTableCellElement>(link, 'td');
			const cpfCnpj = (await this.queryTexto(
				'span[id^="spnCpfParteAutor"]'
			)).replace(/\D/g, '');
			const oabAdvogados = this.queryAll<HTMLAnchorElement>('a', celula).filter(
				oab =>
					Utils.safePipe(oab.getAttribute('onmouseover'), texto =>
						texto.match(/ADVOGADO/)
					)
			);
			const advogados = oabAdvogados.flatMap(oab =>
				maybe(Utils.safePipe(oab.previousElementSibling, el => el.textContent))
			);
			return {
				nome,
				cpfCnpj,
				advogados,
			};
		});
		lefts(autores).then(erros =>
			erros.forEach(erro => {
				console.error(erro);
			})
		);
		return rights(autores);
	}

	async obterAutuacao() {
		return ConversorDataHora.analisar(await this.queryTexto('#txtAutuacao'));
	}

	obterCalculos() {
		return this.destacarDocumentosPorTipo('CALC');
	}

	get contratos() {
		const contratos = this.destacarDocumentosPorTipo('CONHON');
		if (contratos.length > 0) return contratos;
		const outros = this.destacarDocumentosPorMemo(/contrato|honor/i);
		const procuracoes = this.destacarDocumentosPorTipo('PROC');
		return [].concat(outros, procuracoes);
	}

	get honorarios() {
		let honorarios = this.destacarDocumentosPorTipo('SOLPGTOHON');
		honorarios = honorarios.concat(
			this.destacarDocumentosPorTipo('PGTOPERITO')
		);
		return honorarios;
	}

	get informacoesAdicionais() {
		return this.doc.getElementById('fldInformacoesAdicionais');
	}

	get justicaGratuita() {
		const elemento = this.doc.getElementById('lnkJusticaGratuita');
		if (elemento) return elemento.textContent;
		return '???';
	}

	get linkListar() {
		return this.informacoesAdicionais.querySelector<HTMLAnchorElement>(
			'a[href^="controlador.php?acao=processo_precatorio_rpv&"]'
		);
	}

	get magistrado() {
		return this.doc.getElementById('txtMagistrado').textContent;
	}

	get numproc() {
		return this.numprocf.replace(/\D/g, '');
	}

	get numprocf() {
		return this.doc.getElementById('txtNumProcesso').textContent;
	}

	private _requisicoesAPreparar;
	get requisicoesAPreparar() {
		if (!this._requisicoesAPreparar) {
			this._requisicoesAPreparar = new Set();
		}
		return this._requisicoesAPreparar;
	}

	get reus() {
		return Array.from(this.doc.querySelectorAll('[id^="spnNomeParteReu"]')).map(
			elt => elt.textContent
		);
	}

	get sentencas() {
		return this.destacarDocumentosPorEvento(/(^(Julgamento|Sentença))|Voto/);
	}

	get tabelaEventos() {
		return this.doc.getElementById('tblEventos') as HTMLTableElement;
	}

	get transito() {
		const reDecisoesTerminativas = /(^(Julgamento|Sentença))|Voto|Recurso Extraordinário Inadmitido|Pedido de Uniformização para a Turma Nacional - Inadmitido/;
		const reDecurso = /CIÊNCIA, COM RENÚNCIA AO PRAZO|Decurso de Prazo/;
		const reTransito = /Trânsito em Julgado/;
		const reTransitoComData = /Data: (\d\d\/\d\d\/\d\d\d\d)/;

		const dadosTransito: {
			data?: Date;
			dataDecurso?: Date;
			dataEvento?: Date;
			dataFechamento?: Date;
		} = {};

		const linhasEventos = Array.from(this.tabelaEventos.tBodies).reduce(
			(arr, tbody) => arr.concat(Array.from(tbody.rows)),
			[]
		);
		const eventosTransito = linhasEventos.filter(linha =>
			linha.cells[3].textContent.match(reTransito)
		);
		const eventosTransitoComData = eventosTransito.filter(linha =>
			linha.cells[3].textContent.match(reTransitoComData)
		);

		if (eventosTransitoComData.length > 0) {
			const eventoTransitoComData = eventosTransitoComData[0];
			eventoTransitoComData.classList.add('gmEventoDestacado');
			const [data] = eventoTransitoComData.cells[3].textContent
				.match(reTransitoComData)
				.slice(1);
			dadosTransito.data = ConversorData.analisar(data);
		} else if (eventosTransito.length > 0) {
			const eventoTransito = eventosTransito[0];
			eventoTransito.classList.add('gmEventoDestacado');
			const dataEvento = ConversorDataHora.analisar(
				eventoTransito.cells[2].textContent
			);
			dadosTransito.dataEvento = dataEvento;
		}

		if (!dadosTransito.data) {
			const eventosDecisoesTerminativas = linhasEventos.filter(linha =>
				linha.cells[3].textContent.match(reDecisoesTerminativas)
			);
			if (eventosDecisoesTerminativas.length > 0) {
				const eventoDecisaoTerminativa = eventosDecisoesTerminativas[0];
				const numeroEventoDecisaoTerminativa = Utils.parseDecimalInt(
					eventoDecisaoTerminativa.cells[1].textContent
				);
				const reReferenteDecisao = new RegExp(
					'^Intimação Eletrônica - Expedida/Certificada - Julgamento|Refer\\. ao Evento: ' +
						numeroEventoDecisaoTerminativa.toString() +
						'(\\D|$)'
				);
				const eventosIntimacao = linhasEventos.filter(linha => {
					if (
						Utils.parseDecimalInt(linha.cells[1].textContent) <=
						numeroEventoDecisaoTerminativa
					)
						return false;
					if (!linha.cells[3].textContent.match(reReferenteDecisao))
						return false;
					const parte = linha.cells[3].querySelector('.infraEventoPrazoParte');
					if (!parte) return false;
					return parte.dataset.parte.match(/^(AUTOR|REU|MPF)$/) !== null;
				});
				if (eventosIntimacao.length > 0) {
					const reTooltip = /^return infraTooltipMostrar\('([^']+)','Informações do Evento',1000\);$/;
					const informacoesFechamentoIntimacoes = eventosIntimacao
						.map(evento => {
							const lupa = evento.cells[1].querySelector('a[onmouseover]');
							if (!lupa) return null;
							const comando = lupa.getAttribute('onmouseover');
							const [tooltip] = comando.match(reTooltip).slice(1);
							const div = this.doc.createElement('div');
							div.innerHTML = tooltip;
							let textos = Array.from(div.querySelectorAll('font')).map(texto =>
								texto.textContent.trim()
							);
							let indice = 0;
							let textoAtual = textos[indice];
							while (
								textoAtual &&
								textoAtual.match(/^Fechamento do Prazo:$/) === null
							) {
								textoAtual = textos[++indice];
							}
							if (!textoAtual) return null;
							const informacaoDataHora = ConversorDataHora.analisar(
								textos[indice + 1]
							);
							const informacaoEvento = textos[indice + 2];
							const [numeroEvento, descricaoEvento] = informacaoEvento
								.match(/^(\d+) - (.+)$/)
								.slice(1);
							return {
								numero: Utils.parseDecimalInt(numeroEvento),
								data: informacaoDataHora,
								descricao: descricaoEvento,
							};
						})
						.filter(informacao => informacao !== null);
					if (informacoesFechamentoIntimacoes.length > 0) {
						const fechamentoMaisRecente = informacoesFechamentoIntimacoes.reduce(
							(anterior, atual) =>
								anterior.numero > atual.numero ? anterior : atual
						);
						const [eventoFechamentoMaisRecente] = linhasEventos.filter(
							linha =>
								Utils.parseDecimalInt(linha.cells[1].textContent) ===
								fechamentoMaisRecente.numero
						);
						eventoFechamentoMaisRecente.classList.add('gmEventoDestacado');
						if (fechamentoMaisRecente.descricao.match(reDecurso)) {
							dadosTransito.dataDecurso = fechamentoMaisRecente.data;
						} else {
							dadosTransito.dataFechamento = fechamentoMaisRecente.data;
						}
					}
				}
			}
		}

		return dadosTransito;
	}

	constructor(doc: Document) {
		super(doc);
	}

	abrirDocumento(evento, documento) {
		const celula = this.doc.getElementById(`tdEvento${evento}Doc${documento}`);
		if (celula) {
			const link = celula.querySelector<HTMLAnchorElement>(
				'.infraLinkDocumento'
			);
			if (link) link.click();
		}
	}

	abrirJanela(url, nome, abrirEmJanela = false) {
		if (this.janelasDependentes.has(nome)) {
			this.fecharJanela(nome);
		}
		let features = '';
		if (abrirEmJanela) {
			features = 'menubar,toolbar,location,personalbar,status,scrollbars';
		}
		const win = window.open(url, nome, features);
		this.janelasDependentes.set(nome, win);
	}

	abrirJanelaEditarRequisicao(url, numero, abrirEmJanela = false) {
		this.abrirJanela(url, `editar-requisicao${numero}`, abrirEmJanela);
	}

	abrirJanelaListar(abrirEmJanela = false) {
		this.abrirJanela(
			this.linkListar.href,
			`listarRequisicoes${this.numproc}`,
			abrirEmJanela
		);
	}

	abrirJanelaRequisicao(url, numero, abrirEmJanela = false) {
		this.abrirJanela(url, `requisicao${numero}`, abrirEmJanela);
	}

	async adicionarAlteracoes() {
		const win = this.doc.defaultView;
		win.addEventListener('pagehide', () => {
			this.fecharJanelasDependentes();
		});
		win.addEventListener('message', this.onMensagemRecebida.bind(this));
		this.adicionarBotao();
		this.linkListar.addEventListener(
			'click',
			this.onLinkListarClicado.bind(this)
		);
	}

	adicionarBotao() {
		const textoBotao = 'Conferir ofício requisitório';
		const botao = BotaoAcao.criar(textoBotao, evt => {
			evt.preventDefault();
			evt.stopPropagation();
			Promise.resolve()
				.then(() => {
					botao.textContent = 'Aguarde, carregando...';
				})
				.then(async () => {
					const docListar = await XHR.buscarDocumento(this.linkListar.href);
					const paginaListar = new PaginaListar(docListar);
					const listaRequisicoes = await paginaListar.obterRequisicoes();

					const requisicoesAntigas = listaRequisicoes.filter(
						(requisicao): requisicao is RequisicaoListarAntiga =>
							requisicao.tipo === 'antiga' && requisicao.status === 'Digitada'
					);
					if (requisicoesAntigas.length === 1) {
						const requisicao = requisicoesAntigas[0];
						const docRedirecionamento = await XHR.buscarDocumentoExterno(
							requisicao.urlConsultarAntiga
						);
						const paginaRedirecionamento = new PaginaRedirecionamento(
							docRedirecionamento
						);
						const urlRedirecionamento = await paginaRedirecionamento.getUrlRedirecionamento();
						return void this.abrirJanelaRequisicao(
							urlRedirecionamento,
							requisicao.numero
						);
					}

					const requisicoes = listaRequisicoes.filter(
						(requisicao): requisicao is RequisicaoListarNova =>
							requisicao.tipo === 'nova' && requisicao.status === 'Finalizada'
					);
					if (requisicoes.length === 1) {
						const requisicao = requisicoes[0];
						this.urlEditarRequisicoes.set(
							requisicao.numero,
							requisicao.urlEditar
						);
						return void this.abrirJanelaRequisicao(
							requisicao.urlConsultar,
							requisicao.numero
						);
					}
					this.abrirJanelaListar();
				})
				.then(() => {
					botao.textContent = textoBotao;
				})
				.catch(err => {
					console.error(err);
				});
		});

		const frag = this.doc.createDocumentFragment();
		frag.appendChild(this.doc.createElement('br'));
		frag.appendChild(botao);
		frag.appendChild(this.doc.createElement('br'));

		this.informacoesAdicionais.parentElement.insertBefore(
			frag,
			this.informacoesAdicionais.nextSibling
		);

		const ultimoEvento = Utils.parseDecimalInt(
			this.tabelaEventos.tBodies[0].rows[0].cells[1].textContent.trim()
		);
		if (ultimoEvento > 100) {
			botao.insertAdjacentHTML(
				'afterend',
				' <div style="display: inline-block;"><span class="gmTextoDestacado">Processo possui mais de 100 eventos.</span> &mdash; <a href="#" onclick="event.preventDefault(); event.stopPropagation(); this.parentElement.style.display = \'none\'; carregarTodasPaginas(); return false;">Carregar todos os eventos</a></div>'
			);
		}
	}

	destacarDocumentos(
		linksDocumentosLinha: (linha: HTMLTableRowElement) => HTMLAnchorElement[]
	) {
		return Array.from(this.tabelaEventos.tBodies)
			.map(tbody => Array.from(tbody.rows))
			.flatten()
			.reduce((dadosEventos: DadosEvento[], linha) => {
				const documentos = linksDocumentosLinha(linha).reduce(
					(documentos: Documento[], link) => {
						const match = (texto => texto && texto.match(/^(.*?)(\d+)$/))(
							link.textContent
						);
						if (match) {
							const [nome, tipo, ordem] = match;
							documentos.push({
								ordem: Utils.parseDecimalInt(ordem),
								nome,
								tipo,
							});
						}
						return documentos;
					},
					[]
				);

				if (documentos.length > 0) {
					linha.classList.add('gmEventoDestacado');

					const evento = Utils.safePipe(
						linha.cells[1],
						celula => celula.textContent,
						texto => Utils.parseDecimalInt(texto)
					);
					const data = Utils.safePipe(
						linha.cells[2],
						celula => celula.textContent,
						texto => ConversorDataHora.analisar(texto)
					);
					const descricao = Utils.safePipe(
						linha.cells[3],
						celula => celula.querySelector('label.infraEventoDescricao'),
						label => label.textContent
					);
					if (evento && data && descricao) {
						dadosEventos.push({ evento, data, descricao, documentos });
					}
				}
				return dadosEventos;
			}, []);
	}

	destacarDocumentosPorEvento(regularExpression: RegExp) {
		return this.destacarDocumentos(linha => {
			return [linha]
				.filter(linha =>
					Utils.safePipe(
						linha.querySelector<HTMLTableCellElement>(
							'td.infraEventoDescricao'
						),
						c => c.textContent,
						t => regularExpression.test(t.trim())
					)
				)
				.flatMap(linha => this.queryAll('.infraLinkDocumento', linha));
		});
	}

	destacarDocumentosPorMemo(regularExpression: RegExp) {
		return this.destacarDocumentos(linha => {
			let memos = this.queryAll('.infraTextoTooltip', linha).filter(memo =>
				Utils.safePipe(memo.textContent, texto => regularExpression.test(texto))
			);
			return memos
				.flatMap(maybeParent<HTMLTableCellElement>('td'))
				.flatMap(celula =>
					maybe(celula.querySelector<HTMLAnchorElement>('.infraLinkDocumento'))
				);
		});
	}

	destacarDocumentosPorTipo(...abreviacoes: string[]) {
		const regularExpression = new RegExp(
			'^(' + abreviacoes.join('|') + ')\\d+$'
		);
		return this.destacarDocumentos(linha =>
			this.queryAll<HTMLAnchorElement>('.infraLinkDocumento', linha).filter(
				link =>
					Utils.safePipe(link.textContent, texto =>
						regularExpression.test(texto)
					)
			)
		);
	}

	enviarDadosProcesso(janela, origem) {
		const data = {
			acao: Acoes.RESPOSTA_DADOS,
			dados: {
				assuntos: this.assuntos,
				autores: this.autores,
				autuacao: this.autuacao,
				calculos: this.calculos,
				contratos: this.contratos,
				honorarios: this.honorarios,
				justicaGratuita: this.justicaGratuita,
				magistrado: this.magistrado,
				reus: this.reus,
				sentencas: this.sentencas,
				transito: this.transito,
			},
		};
		janela.postMessage(JSON.stringify(data), origem);
	}

	enviarRespostaJanelaAberta(janela, origem) {
		const data = {
			acao: Acoes.RESPOSTA_JANELA_ABERTA,
		};
		this.enviarSolicitacao(janela, origem, data);
	}

	enviarSolicitacao(janela, origem, dados) {
		janela.postMessage(JSON.stringify(dados), origem);
	}

	enviarSolicitacaoPrepararIntimacao(janela, origem, requisicao) {
		const data = {
			acao: Acoes.PREPARAR_INTIMACAO_ANTIGA,
			requisicao: requisicao,
		};
		this.enviarSolicitacao(janela, origem, data);
	}

	fecharJanela(nome) {
		const win = this.janelasDependentes.get(nome);
		this.fecharObjetoJanela(win);
		this.janelasDependentes.delete(nome);
	}

	fecharJanelasDependentes() {
		for (let nome of this.janelasDependentes.keys()) {
			this.fecharJanela(nome);
		}
	}

	fecharJanelaProcesso() {
		this.fecharJanelasDependentes();
		const win = this.doc.defaultView.wrappedJSObject;
		const abertos = win.documentosAbertos;
		if (abertos) {
			for (let id in abertos) {
				let janela = abertos[id];
				this.fecharObjetoJanela(janela);
			}
		}
		win.close();
	}

	fecharJanelaRequisicao(numero) {
		this.fecharJanela(`requisicao${numero}`);
	}

	fecharObjetoJanela(win) {
		try {
			if (win && !win.closed) {
				win.close();
			}
		} catch (err) {
			// A aba já estava fechada
		}
	}

	onLinkListarClicado(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		let abrirEmJanela = false;
		if (evt.shiftKey) {
			abrirEmJanela = true;
		}
		this.abrirJanelaListar(abrirEmJanela);
	}

	onMensagemRecebida(evt) {
		console.info('Mensagem recebida', evt);
		if (
			evt.origin === 'http://sap.trf4.gov.br' ||
			evt.origin === this.doc.location.origin
		) {
			const data = JSON.parse(evt.data);
			if (evt.origin === 'http://sap.trf4.gov.br') {
				if (data.acao === Acoes.BUSCAR_DADOS) {
					this.enviarDadosProcesso(evt.source, evt.origin);
				} else if (data.acao === Acoes.ABRIR_DOCUMENTO) {
					this.abrirDocumento(data.evento, data.documento);
				} else if (data.acao === Acoes.EDITAR_REQUISICAO_ANTIGA) {
					this.abrirJanelaEditarRequisicao(
						data.urlEditarAntiga,
						data.requisicao
					);
				} else if (data.acao === Acoes.PREPARAR_INTIMACAO_ANTIGA) {
					this.requisicoesAPreparar.add(data.requisicao);
					if (data.fecharProcesso) {
						this.fecharAposPreparar.add(data.requisicao);
					}
					this.abrirJanelaEditarRequisicao(
						data.urlEditarAntiga,
						data.requisicao
					);
				} else if (data.acao === Acoes.VERIFICAR_JANELA) {
					if (this.requisicoesAPreparar.has(data.requisicao)) {
						this.enviarSolicitacaoPrepararIntimacao(
							evt.source,
							evt.origin,
							data.requisicao
						);
					}
				} else if (data.acao === Acoes.ORDEM_CONFIRMADA) {
					if (
						data.ordem === Acoes.PREPARAR_INTIMACAO_ANTIGA &&
						this.requisicoesAPreparar.has(data.requisicao)
					) {
						this.requisicoesAPreparar.delete(data.requisicao);
					}
				} else if (data.acao === Acoes.REQUISICAO_ANTIGA_PREPARADA) {
					this.fecharJanelaRequisicao(data.requisicao);
					if (this.fecharAposPreparar.has(data.requisicao)) {
						this.fecharJanelaProcesso();
					}
				}
			} else if (evt.origin === this.doc.location.origin) {
				if (data.acao === Acoes.VERIFICAR_JANELA) {
					this.enviarRespostaJanelaAberta(evt.source, evt.origin);
				} else if (data.acao === Acoes.ABRIR_REQUISICAO) {
					console.log('Pediram-me para abrir uma requisicao', data.requisicao);
					if (data.requisicao.tipo === 'antiga') {
						this.abrirJanelaRequisicao(
							data.requisicao.urlConsultarAntiga,
							data.requisicao.numero
						);
					} else if (data.requisicao.tipo === 'nova') {
						this.abrirJanelaRequisicao(
							data.requisicao.urlConsultar,
							data.requisicao.numero
						);
					}
				} else if (data.acao === Acoes.EDITAR_REQUISICAO) {
					const numero = data.requisicao;
					this.fecharJanelaRequisicao(numero);
					const urlEditar = this.urlEditarRequisicoes.get(numero);
					this.abrirJanelaEditarRequisicao(urlEditar, numero);
				} else if (data.acao === Acoes.ABRIR_DOCUMENTO) {
					this.abrirDocumento(data.evento, data.documento);
				} else if (data.acao === Acoes.BUSCAR_DADOS) {
					this.enviarDadosProcesso(evt.source, evt.origin);
				}
			}
		}
	}
}

function maybe<T>(obj: T): NonNullable<T>[] {
	return [obj].filter((x): x is NonNullable<T> => Boolean(x));
}

function maybeParent<T extends HTMLElement = HTMLElement>(selector: string) {
	return (element: Node) => {
		let parent = element.parentElement;
		while (parent !== null && !parent.matches(selector)) {
			parent = parent.parentElement;
		}
		return parent === null ? [] : [<T>parent];
	};
}

function promiseParent<T extends HTMLElement = HTMLElement>(
	element: Node,
	selector: string
) {
	let parent = element.parentElement;
	while (parent !== null && !parent.matches(selector)) {
		parent = parent.parentElement;
	}
	return parent === null
		? Promise.reject(new Error(`Ancestral não encontrado: ${selector}.`))
		: Promise.resolve(<T>parent);
}

function promiseText(elemento: Node) {
	const texto = elemento.textContent;
	return texto
		? Promise.resolve(texto)
		: Promise.reject(new Error('Elemento não possui texto.'));
}
