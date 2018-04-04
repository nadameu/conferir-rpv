import Acoes from '../Acoes';
import AnalisadorLinhasTabela from '../AnalisadorLinhasTabela';
import BotaoAcao from '../BotaoAcao';
import { SALARIO_MINIMO } from '../Constantes';
import {
	ConversorAno,
	ConversorBool,
	ConversorData,
	ConversorDataHora,
	ConversorInt,
	ConversorMesAno,
	ConversorMoeda,
	ConversorPorcentagem,
	ConversorValores,
} from '../Conversor';
import Pagina from './Pagina';
import Padrao from '../Padrao';
import * as Utils from '../Utils';

export default class PaginaRequisicao extends Pagina {

	constructor(doc: Document) {
		super(doc);
	}

	get requisicao() {
		if (! this._requisicao) {
			this._requisicao = this.analisarDadosRequisicao();
		}
		return this._requisicao;
	}

	adicionarAlteracoes() {
		const style = this.doc.createElement('style');
		style.innerHTML = Utils.css({
			'table a': {
				'font-size': '1em',
			},
			'.gm-requisicao__tabela tr::before': {
				content: '\'\'',
				'font-size': '1.2em',
				'font-weight': 'bold',
			},
			'.gm-resposta': {},
			'p.gm-resposta': {
				'font-size': '1.2em',
				margin: '1em 0 0',
			},
			'.gm-resposta--correta': {
				color: 'hsl(120, 25%, 75%)',
			},
			'.gm-resposta--incorreta': {
				color: 'hsl(0, 100%, 40%)',
				'text-shadow': '0 2px 2px hsl(0, 75%, 60%)',
			},
			'.gm-resposta--indefinida': {
				color: 'hsl(30, 100%, 40%)',
				'text-shadow': '0 2px 3px hsl(30, 75%, 60%)',
			},
			'.gm-requisicao__tabela .gm-resposta--correta td, .gm-requisicao__tabela .gm-resposta--correta span': {
				color: 'hsl(240, 10%, 65%)',
			},
			'.gm-requisicao__tabela .gm-resposta--correta::before': {
				content: '\'✓\'',
				color: 'hsl(120, 25%, 65%)',
			},
			'.gm-requisicao__tabela .gm-resposta--incorreta td, .gm-requisicao__tabela .gm-resposta--incorreta span': {
				color: 'hsl(0, 100%, 40%)',
			},
			'.gm-requisicao__tabela .gm-resposta--incorreta::before': {
				content: '\'✗\'',
				color: 'hsl(0, 100%, 40%)',
				'text-shadow': 'none',
			},
			'.gm-requisicao__tabela .gm-resposta--indefinida td, .gm-requisicao__tabela .gm-resposta--indefinida span': {
				color: 'hsl(30, 100%, 40%)',
			},
			'.gm-requisicao__tabela .gm-resposta--indefinida::before': {
				content: '\'?\'',
				color: 'hsl(30, 100%, 40%)',
				'text-shadow': 'none',
			},
			'p.gm-dados-adicionais': {
				'margin-top': '0',
				'margin-left': '2ex',
			},
			'.gm-botoes': {
				margin: '4em 0',
				display: 'flex',
				'justify-content': 'space-around',
			},
			'table.gm-tabela-eventos td': {
				padding: '0 0.5ex',
			},
		});
		this.doc.querySelector('head').appendChild(style);
		const win = this.doc.defaultView;
		win.addEventListener('message', this.onMensagemRecebida.bind(this));
		// this.linkEditar.addEventListener('click', this.onLinkEditarClicado.bind(this));
		this.enviarSolicitacaoDados(win.opener);
	}

	adicionarAreaDocumentosProcesso() {
		const areaTabela = this.doc.getElementById('divInfraAreaTabela');
		areaTabela.insertAdjacentHTML(
			'beforeend',
			'<div class="gm-documentos"></div>'
		);
	}

	adicionarBotaoTelaIntimacao() {
		const botaoTelaIntimacao = BotaoAcao.criar(
			'Ir para tela de intimação',
			this.onBotaoTelaIntimacaoClicado.bind(this)
		);

		const areaTabela = this.doc.getElementById('divInfraAreaTabela');
		areaTabela.insertAdjacentHTML('beforeend', '<div class="gm-botoes"></div>');
		const areaBotoes = this.doc.querySelector('.gm-botoes');
		areaBotoes.appendChild(botaoTelaIntimacao);
	}

	analisarDadosProcesso(dadosProcesso) {
		console.log('Dados do processo:', dadosProcesso);
		this.validarDadosProcesso(dadosProcesso);
		this.exibirDocumentosProcesso(dadosProcesso);
	}

	analisarDadosRequisicao() {
		const analisador = new AnalisadorLinhasTabela(
			new Padrao(/^<span class="titBold">Status:<\/span> (.*?)$/, 'status'),
			new Padrao(
				/^<span class="titBold">Originário Jef:<\/span> (.*?)$/,
				'originarioJEF'
			),
			new Padrao(
				/^<span class="titBold">Extra Orçamentária:<\/span> (.*?)$/,
				'extraorcamentaria'
			),
			new Padrao(
				/^<span class="titBold">Processo Eletrônico:<\/span> (.*?)$/,
				'processoEletronico'
			),
			new Padrao(/^<span class="titBold">Juízo:<\/span> (.*?)$/, 'juizo'),
			new Padrao(
				/^<span class="titBold">Ação de Execução:<\/span> (.*?)$/,
				'acaoDeExecucao'
			),
			new Padrao(
				/^<span class="titBold">Ação Originária:<\/span> (.*?)$/,
				'acaoOriginaria'
			),
			new Padrao(
				/^<span class="titBold">Total Requisitado \(R\$\):<\/span> (.*)$/,
				'valorTotalRequisitado'
			),
			new Padrao(
				/^<span class="titBold">Requerido:<\/span> (.*)$/,
				'requerido'
			),
			new Padrao(/^<span class="titBold">Advogado:<\/span> ?(.*)$/, 'advogado'),
			new Padrao(
				/^<span class="titBold">Assunto Judicial:<\/span> (\d+)\s+- (.*)\s*$/,
				'codigoAssunto',
				'assunto'
			),
			new Padrao(
				/^<span class="titBold">Data do ajuizamento do processo de conhecimento:<\/span> (\d\d\/\d\d\/\d\d\d\d)$/,
				'dataAjuizamento'
			),
			new Padrao(
				/^<span class="titBold">Data do trânsito em julgado do processo de conhecimento:<\/span> (\d\d\/\d\d\/\d\d\d\d)$/,
				'dataTransito'
			),
			new Padrao(
				/^<span class="titBold">Data do trânsito em julgado da sentença ou acórdão\(JEF\):<\/span> (\d\d\/\d\d\/\d\d\d\d)$/,
				'dataTransito'
			)
		);
		analisador.definirConversores({
			originarioJEF: ConversorBool,
			extraorcamentaria: ConversorBool,
			processoEletronico: ConversorBool,
			dataHora: ConversorDataHora,
			valorTotalRequisitado: ConversorMoeda,
			naturezaTributaria: ConversorBool,
			dataAjuizamento: ConversorData,
			dataTransito: ConversorData,
		});
		analisador.prefixo = 'gm-requisicao__dados';

		const requisicao = new Requisicao();

		const titulo = this.doc.querySelector('.titReq').textContent.trim();
		const numero = titulo.match(/^Requisição Nº: (\d+)$/)[1];
		requisicao.numero = Utils.parseDecimalInt(numero);
		// requisicao.urlEditarAntiga = linkEditar.href;

		const tabela = this.doc.querySelector(
			'#divInfraAreaTabela > table:nth-child(2)'
		);
		tabela.classList.add('gm-requisicao__tabela');
		analisador.analisarInto(tabela, requisicao);

		let elementoAtual = tabela.nextElementSibling;
		let modo = null;
		let ordinal = 0;
		while (elementoAtual) {
			switch (elementoAtual.tagName.toLowerCase()) {
				case 'table':
					if (elementoAtual.textContent.trim() === 'Beneficiários') {
						modo = 'Beneficiários';
						ordinal = 0;
					} else if (elementoAtual.textContent.trim() === 'Honorários') {
						modo = 'Honorários';
						ordinal = 0;
					} else if (modo === 'Beneficiários') {
						requisicao.beneficiarios.push(
							this.analisarTabelaBeneficiarios(elementoAtual, ordinal++)
						);
					} else if (modo === 'Honorários') {
						requisicao.honorarios.push(
							this.analisarTabelaHonorarios(elementoAtual, ordinal++)
						);
					} else {
						console.error('Tabela não analisada!', elementoAtual);
						throw new Error('Tabela não analisada!');
					}
					break;
			}
			elementoAtual = elementoAtual.nextElementSibling;
		}

		return requisicao;
	}

	analisarTabela(tabela, prefixo) {
		tabela.classList.add('gm-requisicao__tabela');
		const analisador = new AnalisadorLinhasTabela(
			new Padrao(
				/^<span class="titBoldUnder">(.+) \(([\d./-]+)\)<\/span>$/,
				'nome',
				'cpfCnpj'
			),
			new Padrao(/^<span class="titBold">Espécie:<\/span> (.*)$/, 'especie'),
			new Padrao(
				/^<span class="titBold">Tipo Honorário<\/span> (.+)$/,
				'tipoHonorario'
			),
			new Padrao(
				/^<span class="titBold">Data Base:<\/span> (\d\d\/\d\d\d\d)&nbsp;&nbsp;&nbsp;&nbsp;<span class="titBold">Valor Requisitado \(Principal Corrigido \+ Juros\):<\/span> ([\d.,]+ \([\d.,]+ \+ [\d.,]+\))$/,
				'dataBase',
				'valor'
			),
			new Padrao(
				/^<span class="titBold">Data Base:<\/span> (\d\d\/\d\d\d\d)&nbsp;&nbsp;&nbsp;&nbsp;<span class="titBold">Valor Requisitado \(Principal \+ Valor Selic\):<\/span> ([\d.,]+ \([\d.,]+ \+ [\d.,]+\))$/,
				'dataBase',
				'valor'
			),
			new Padrao(
				/^<span class="titBold">(VALOR (?:BLOQUEADO|LIBERADO))<\/span>$/,
				'bloqueado'
			),
			new Padrao(
				/^<span class="titBold">Juros de Mora Fix.no Tít. Executivo:<\/span> (.*)$/,
				'tipoJuros'
			),
			new Padrao(
				/^<span class="titBold">Tipo de Despesa:<\/span> (?:.*) \((\d+)\)$/,
				'codigoTipoDespesa'
			),
			new Padrao(
				/^<span class="titBold">Doença Grave:<\/span> (Sim|Não|)$/,
				'doencaGrave'
			),
			new Padrao(
				/^<span class="titBold">Renuncia Valor:<\/span> ?(Sim|Não|)$/,
				'renunciaValor'
			),
			new Padrao(
				/^<span class="titBold">IRPF- RRA a deduzir:<\/span> (Sim|Não)$/,
				'irpf'
			),
			new Padrao(
				/^<span class="titBold">Ano Exercicio Corrente:<\/span> (\d\d\d\d)&nbsp;&nbsp;&nbsp;&nbsp;<span class="titBold">Meses Exercicio Corrente:<\/span> (\d*)&nbsp;&nbsp;&nbsp;&nbsp;<span class="titBold">Valor Exercicio Corrente:<\/span> ([\d.,]+)$/,
				'anoCorrente',
				'mesesCorrente',
				'valorCorrente'
			),
			new Padrao(
				/^<span class="titBold">Ano Exercicio Corrente:<\/span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="titBold">Meses Exercicio Corrente:<\/span> (\d*)&nbsp;&nbsp;&nbsp;&nbsp;<span class="titBold">Valor Exercicio Corrente:<\/span> ([\d.,]+)$/,
				'mesesCorrente',
				'valorCorrente'
			),
			new Padrao(
				/^<span class="titBold">Meses Exercicio Anterior:<\/span> (\d*)&nbsp;&nbsp;&nbsp;&nbsp;<span class="titBold">Valor Exercicio Anterior:<\/span> ([\d.,]+)$/,
				'mesesAnterior',
				'valorAnterior'
			),
			new Padrao(
				/^<span class="titBold">Beneficiário:<\/span> (.+)$/,
				'beneficiario'
			),
			new Padrao(
				/^<span class="titBold">Requisição de Natureza Tributária \(ATUALIZADA PELA SELIC\):<\/span> (Sim|Não)$/,
				'naturezaTributaria'
			)
		);
		analisador.definirConversores({
			dataBase: ConversorMesAno,
			valor: ConversorValores,
			bloqueado: class extends Conversor {
				static analisar(texto) {
					return texto === 'VALOR BLOQUEADO';
				}
				static converter(valor) {
					return valor ? 'VALOR BLOQUEADO' : 'VALOR LIBERADO';
				}
			},
			doencaGrave: ConversorBool,
			renunciaValor: ConversorBool,
			irpf: ConversorBool,
			anoCorrente: ConversorAno,
			mesesCorrente: ConversorInt,
			valorCorrente: ConversorMoeda,
			mesesAnterior: ConversorInt,
			valorAnterior: ConversorMoeda,
			naturezaTributaria: ConversorBool,
		});
		analisador.prefixo = prefixo;

		return analisador.analisar(tabela);
	}

	analisarTabelaBeneficiarios(tabela, ordinal) {
		tabela.classList.add('gm-requisicao__beneficiarios__tabela');
		return this.analisarTabela(
			tabela,
			`gm-requisicao__beneficiario--${ordinal}`
		);
	}

	analisarTabelaHonorarios(tabela, ordinal) {
		tabela.classList.add('gm-requisicao__honorarios__tabela');
		return this.analisarTabela(tabela, `gm-requisicao__honorario--${ordinal}`);
	}

	enviarSolicitacao(janela, data) {
		janela.postMessage(JSON.stringify(data), this.doc.location.origin);
	}

	enviarSolicitacaoAberturaDocumento(janela, evento, documento) {
		const data = {
			acao: Acoes.ABRIR_DOCUMENTO,
			evento: evento,
			documento: documento,
		};
		return this.enviarSolicitacao(janela, data);
	}

	enviarSolicitacaoDados(janela) {
		const data = {
			acao: Acoes.BUSCAR_DADOS,
		};
		return this.enviarSolicitacao(janela, data);
	}

	enviarSolicitacaoEditarRequisicao(janela, requisicao) {
		const data = {
			acao: Acoes.EDITAR_REQUISICAO,
			requisicao,
		};
		return this.enviarSolicitacao(janela, data);
	}

	exibirDocumentosProcesso(dadosProcesso) {
		const areaDocumentos = this.doc.querySelector('.gm-documentos');
		this.exibirTitulo('Documentos do processo', areaDocumentos);
		let tabela = [
			'<table class="infraTable gm-tabela-eventos">',
			'<thead>',
			'<tr>',
			'<th class="infraTh">Evento</th>',
			'<th class="infraTh">Data</th>',
			'<th class="infraTh">Descrição</th>',
			'<th class="infraTh">Documentos</th>',
			'</tr>',
			'</thead>',
			'<tbody>',
		].join('\n');
		let css = 0;
		const eventos = Array.concat(
			dadosProcesso.calculos,
			dadosProcesso.contratos,
			dadosProcesso.honorarios,
			dadosProcesso.sentencas
		)
			.sort((eventoA, eventoB) => eventoB.evento - eventoA.evento)
			.reduce((map, evento) => {
				if (map.has(evento.evento)) {
					evento.documentos.forEach(documento => {
						map.get(evento.evento).documentos.set(documento.ordem, documento);
					});
				} else {
					evento.documentos = new Map(
						evento.documentos.map(documento => [documento.ordem, documento])
					);
					map.set(evento.evento, evento);
				}
				return map;
			}, new Map());
		Array.from(eventos.values()).forEach(evento => {
			tabela += [
				`<tr class="${css++ % 2 === 0 ? 'infraTrClara' : 'infraTrEscura'}">`,
				`<td>${evento.evento}</td>`,
				`<td>${ConversorDataHora.converter(new Date(evento.data))}</td>`,
				`<td>${evento.descricao}</td>`,
				'<td><table><tbody>',
			].join('\n');
			Array.from(evento.documentos.values())
				.slice()
				.sort((a, b) => a.ordem - b.ordem)
				.forEach(documento => {
					tabela += `<tr><td><a class="infraLinkDocumento" id="gm-documento-ev${evento.evento}-doc${documento.ordem}" data-evento="${evento.evento}" data-documento="${documento.ordem}" href="#">${documento.nome}</a></td></tr>`;
				});
			tabela += ['</tbody></table></td>', '</tr>'].join('\n');
		});
		tabela += ['</tbody>', '</table>'].join('\n');
		areaDocumentos.insertAdjacentHTML('beforeend', tabela);
		eventos.forEach(evento => {
			evento.documentos.forEach(documento => {
				const link = this.doc.getElementById(
					`gm-documento-ev${evento.evento}-doc${documento.ordem}`
				);
				link.addEventListener('click', this.onLinkDocumentoClicado.bind(this));
			});
		});
		this.exibirTitulo('Justiça Gratuita', areaDocumentos);
		areaDocumentos.insertAdjacentHTML(
			'beforeend',
			`<p class="gm-resposta">${dadosProcesso.justicaGratuita}</p>`
		);
	}

	exibirTitulo(texto, elemento) {
		elemento.insertAdjacentHTML(
			'beforeend',
			`<br><br><table width="100%"><tbody><tr><td><span class="titSecao">${texto}</span></td></tr></tbody></table>`
		);
	}

	exibirValoresCalculados() {
		const requisicao = this.requisicao;
		const areaTabela = this.doc.getElementById('divInfraAreaTabela');
		this.exibirTitulo('Conferência dos cálculos', areaTabela);

		requisicao.beneficiarios.forEach((beneficiario, ordinal) => {
			const prefixo = `.gm-requisicao__beneficiario--${ordinal}`;
			this.validarElemento(`${prefixo}__valor`, true);
			const nome = beneficiario.nome;
			let principal = beneficiario.valor.principal,
				juros = beneficiario.valor.juros,
				total = beneficiario.valor.total;
			const honorarios = requisicao.honorarios
				.map((honorario, ordinal) => Object.assign({}, honorario, { ordinal }))
				.filter(
					honorario => honorario.tipoHonorario === 'Honorários Contratuais'
				)
				.filter(
					honorario =>
						honorario.beneficiario.toUpperCase() ===
						beneficiario.nome.toUpperCase()
				);
			honorarios.forEach(honorario => {
				const prefixo = `.gm-requisicao__honorario--${honorario.ordinal}`;
				this.validarElemento(`${prefixo}__tipoHonorario`, true);
				principal += honorario.valor.principal;
				juros += honorario.valor.juros;
				total += honorario.valor.total;
			});
			let porcentagemAdvogado = 1 - beneficiario.valor.total / total;
			let porcentagemArredondada = Utils.round(porcentagemAdvogado * 100, 0);
			let calculoAdvogado = Utils.round(
				total * porcentagemArredondada / 100,
				2
			);
			let pagoAdvogado = Utils.round(total - beneficiario.valor.total, 2);
			let diferenca = pagoAdvogado - calculoAdvogado;
			if (Math.abs(diferenca) > 0.01) {
				porcentagemArredondada = porcentagemAdvogado * 100;
			}
			[principal, juros, total] = [principal, juros, total].map(valor =>
				ConversorMoeda.converter(valor)
			);
			areaTabela.insertAdjacentHTML(
				'beforeend',
				`<p class="gm-resposta">${nome} &mdash; <span class="gm-resposta--indefinida">${principal}</span> + <span class="gm-resposta--indefinida">${juros}</span> = <span class="gm-resposta--indefinida">${total}</span> em <span class="gm-resposta--indefinida">${ConversorMesAno.converter(
					beneficiario.dataBase
				)}</span></p>`
			);
			if (beneficiario.irpf) {
				this.validarElemento(`${prefixo}__irpf`, true);
				let mesesAnterior = beneficiario.mesesAnterior;
				let valorAnterior = beneficiario.valorAnterior;
				if (porcentagemAdvogado > 0) {
					valorAnterior = valorAnterior / (1 - porcentagemAdvogado);
				}
				areaTabela.insertAdjacentHTML(
					'beforeend',
					`<p class="gm-resposta gm-dados-adicionais">IRPF &mdash; Exercício Anterior &mdash; <span class="gm-resposta--indefinida">${ConversorInt.converter(
						mesesAnterior
					)} ${mesesAnterior > 1
						? 'meses'
						: 'mês'}</span> &mdash; <span class="gm-resposta--indefinida">${ConversorMoeda.converter(
						valorAnterior
					)}</span></p>`
				);
				// }
				// if (beneficiario.irpf.corrente) {
				let mesesCorrente = beneficiario.mesesCorrente;
				let valorCorrente = beneficiario.valorCorrente;
				if (porcentagemAdvogado > 0) {
					valorCorrente = valorCorrente / (1 - porcentagemAdvogado);
				}
				const anoCorrente =
					beneficiario.anoCorrente === undefined
						? ''
						: `(<span class="gm-resposta--indefinida">${beneficiario.anoCorrente
							? ConversorAno.converter(beneficiario.anoCorrente)
							: ''}</span>)`;
				areaTabela.insertAdjacentHTML(
					'beforeend',
					`<p class="gm-resposta gm-dados-adicionais">IRPF &mdash; Exercício Corrente ${anoCorrente} &mdash; <span class="gm-resposta--indefinida">${ConversorInt.converter(
						mesesCorrente
					)} ${mesesCorrente > 1
						? 'meses'
						: 'mês'}</span> &mdash; <span class="gm-resposta--indefinida">${ConversorMoeda.converter(
						valorCorrente
					)}</span></p>`
				);
				// }
			}
			if (beneficiario.pss) {
				if (beneficiario.pss.semIncidencia) {
					areaTabela.insertAdjacentHTML(
						'beforeend',
						'<p class="gm-resposta gm-dados-adicionais"><span class="gm-resposta--indefinida">SEM</span> incidência de PSS</p>'
					);
				} else {
					areaTabela.insertAdjacentHTML(
						'beforeend',
						'<p class="gm-resposta gm-dados-adicionais"><span class="gm-resposta--indefinida">COM</span> incidência de PSS</p>'
					);
					if (beneficiario.irpf) {
						areaTabela.insertAdjacentHTML(
							'beforeend',
							'<p class="gm-resposta gm-dados-adicionais"><span class="gm-resposta--incorreta">Verificar se é caso de deduzir PSS da base de cálculo do IRPF</span></p>'
						);
					}
				}
			}
			if (porcentagemAdvogado > 0) {
				const valoresHonorarios = honorarios.map(
					honorario => honorario.valor.total
				);
				const somaHonorarios = valoresHonorarios.reduce((a, b) => a + b, 0);
				const porcentagens = valoresHonorarios
					.map(valor => valor / somaHonorarios)
					.map(pct => pct * porcentagemArredondada / 100)
					.map(pct => ConversorPorcentagem.converter(pct));
				const advogados = honorarios
					.map(honorario => honorario.nome)
					.map(
						(nome, i) =>
							porcentagens.length < 2 ? nome : `${nome} (${porcentagens[i]})`
					)
					.join(', ');
				areaTabela.insertAdjacentHTML(
					'beforeend',
					`<p class="gm-resposta gm-dados-adicionais">Honorários Contratuais &mdash; ${advogados} &mdash; <span class="gm-resposta--indefinida">${ConversorPorcentagem.converter(
						porcentagemArredondada / 100
					)}</span></p>`
				);
			}
		});

		requisicao.honorarios
			.map((honorario, ordinal) => Object.assign({}, honorario, { ordinal }))
			.filter(honorario => honorario.tipoHonorario !== 'Honorários Contratuais')
			.forEach(honorario => {
				const prefixo = `.gm-requisicao__honorario--${honorario.ordinal}`;
				this.validarElemento(`${prefixo}__nome`, true);
				this.validarElemento(`${prefixo}__tipoHonorario`, true);
				this.validarElemento(`${prefixo}__valor`, true);
				areaTabela.insertAdjacentHTML(
					'beforeend',
					[
						`<p class="gm-resposta gm-resposta--indefinida">${honorario.nome}</p>`,
						`<p class="gm-resposta gm-dados-adicionais"><span class="gm-resposta--indefinida">${honorario.tipoHonorario}</span> &mdash; <span class="gm-resposta--indefinida">${ConversorMoeda.converter(
							honorario.valor.principal
						)}</span> + <span class="gm-resposta--indefinida">${ConversorMoeda.converter(
							honorario.valor.juros
						)}</span> = <span class="gm-resposta--indefinida">${ConversorMoeda.converter(
							honorario.valor.total
						)}</span> em <span class="gm-resposta--indefinida">${ConversorMesAno.converter(
							honorario.dataBase
						)}</span></p>`,
					].join('\n')
				);
			});
	}

	onBotaoTelaIntimacaoClicado(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		const opener = this.doc.defaultView.opener;
		this.enviarSolicitacaoEditarRequisicao(opener, this.requisicao.numero);
	}

	onLinkDocumentoClicado(evt) {
		evt.preventDefault();
		const elemento = evt.target;
		const evento = elemento.dataset.evento;
		const documento = elemento.dataset.documento;
		const win = this.doc.defaultView;
		this.enviarSolicitacaoAberturaDocumento(win.opener, evento, documento);
	}

	onMensagemRecebida(evt) {
		console.info('Mensagem recebida', evt);
		if (evt.origin === this.doc.location.origin) {
			const data = JSON.parse(evt.data);
			if (data.acao === Acoes.RESPOSTA_DADOS) {
				console.log('Dados da requisicação:', this.requisicao);
				this.validarDadosRequisicao();
				this.exibirValoresCalculados();
				this.adicionarAreaDocumentosProcesso();
				this.adicionarBotaoTelaIntimacao();
				this.analisarDadosProcesso(data.dados);
			}
		}
	}

	validarDadosProcesso(dadosProcesso) {
		const requisicao = this.requisicao;

		this.validarElemento(
			'.gm-requisicao__dados__codigoAssunto',
			dadosProcesso.assuntos.indexOf(requisicao.codigoAssunto) > -1
		);
		const dataAutuacao = ConversorData.converter(
			new Date(dadosProcesso.autuacao)
		);
		this.validarElemento(
			'.gm-requisicao__dados__dataAjuizamento',
			dataAutuacao === ConversorData.converter(requisicao.dataAjuizamento) ||
				undefined
		);

		// Conferir data de trânsito em julgado
		let dataTransito = ConversorData.converter(
			new Date(dadosProcesso.transito.data || 0)
		);
		let dataEvento = ConversorData.converter(
			new Date(dadosProcesso.transito.dataEvento || 0)
		);
		let dataDecurso = ConversorData.converter(
			new Date(dadosProcesso.transito.dataDecurso || 0)
		);
		let dataFechamento = ConversorData.converter(
			new Date(dadosProcesso.transito.dataFechamento || 0)
		);
		let dataTransitoRequisicao = ConversorData.converter(
			requisicao.dataTransito
		);
		let isTrue =
			dataTransito === dataTransitoRequisicao ||
			dataDecurso === dataTransitoRequisicao;
		let isUndefined =
			dataEvento === dataTransitoRequisicao ||
			dataFechamento === dataTransitoRequisicao;
		this.validarElemento(
			'.gm-requisicao__dados__dataTransito',
			isTrue || isUndefined && undefined
		);

		// Conferir se requerido é réu na ação
		this.validarElemento(
			'.gm-requisicao__dados__requerido',
			dadosProcesso.reus.indexOf(requisicao.requerido) > -1 &&
				(dadosProcesso.reus.length === 1 || undefined)
		);

		// Conferir se beneficiário é autor da ação
		requisicao.beneficiarios.forEach((beneficiario, ordinal) => {
			const prefixo = `gm-requisicao__beneficiario--${ordinal}`;
			const autoresMesmoCPF = dadosProcesso.autores.filter(
				autor => autor.cpfCnpj === beneficiario.cpfCnpj.replace(/[./-]/g, '')
			);
			// const autoresMesmoCPFeNome = autoresMesmoCPF.filter(autor => autor.nome.toUpperCase() === beneficiario.nome.toUpperCase());
			this.validarElemento(
				`.${prefixo}__cpfCnpj`,
				autoresMesmoCPF.length === 1
			);
			// this.validarElemento(`.${prefixo}__nome`, autoresMesmoCPFeNome.length === 1);
		});

		// Conferir se advogados representam autores da ação
		const advogados = dadosProcesso.autores.reduce((set, autor) => {
			autor.advogados.forEach(advogado => set.add(advogado.toUpperCase()));
			return set;
		}, new Set());
		requisicao.honorarios.forEach((honorario, ordinal) => {
			const prefixo = `gm-requisicao__honorario--${ordinal}`;
			if (honorario.tipoHonorario === 'Honorários Contratuais') {
				const autor = dadosProcesso.autores.find(
					autor => autor.nome.toUpperCase() === honorario.beneficiario
				);
				if (autor) {
					const advogadosAutorMesmoNome = autor.advogados.filter(
						advogado => advogado.toUpperCase() === honorario.nome.toUpperCase()
					);
					this.validarElemento(
						`.${prefixo}__nome`,
						advogadosAutorMesmoNome.length === 1
					);
				} else {
					this.validarElemento(`.${prefixo}__nome`, false);
				}
			} else if (honorario.tipoHonorario === 'Honorários de Sucumbência') {
				this.validarElemento(
					`.${prefixo}__nome`,
					advogados.has(honorario.nome.toUpperCase())
				);
			}
		});
	}

	validarDadosRequisicao() {
		const requisicao = this.requisicao;

		// Status da requisição deve ser "Finalizada"
		this.validarElemento(
			'.gm-requisicao__dados__status',
			requisicao.status === 'Finalizada'
		);

		this.validarElemento('.gm-requisicao__dados__originarioJEF', true);
		this.validarElemento('.gm-requisicao__dados__extraorcamentaria', true);
		this.validarElemento('.gm-requisicao__dados__processoEletronico', true);
		this.validarElemento('.gm-requisicao__dados__juizo', true);
		this.validarElemento('.gm-requisicao__dados__acaoDeExecucao', true);
		this.validarElemento('.gm-requisicao__dados__acaoOriginaria', true);
		this.validarElemento('.gm-requisicao__dados__advogado', true);

		// 11.NATUREZA ALIMENTÍCIA - Salários, vencimentos, proventos, pensões e suas complementações
		// 12.NATUREZA ALIMENTÍCIA - Benefícios previdenciários e indenizações por morte ou invalidez
		// 21.NATUREZA NÃO ALIMENTÍCIA
		// 31.DESAPROPRIAÇÕES - Único imóvel residencial do credor
		// 39.DESAPROPRIAÇÕES - Demais
		const ehPrevidenciario = requisicao.codigoAssunto.match(/^04/) !== null;
		const ehServidor = requisicao.codigoAssunto.match(/^011[012]/) !== null;
		const ehDesapropriacao = requisicao.codigoAssunto.match(/^0106/) !== null;
		const ehTributario = requisicao.codigoAssunto.match(/^03/) !== null;
		let codigoNaturezaCorreto = undefined;

		const pagamentos = Array.concat(
			...['beneficiario', 'honorario'].map(tipo => {
				const colecao = `${tipo}s`;
				return requisicao[colecao].map((pagamento, ordinal) => {
					if (tipo === 'beneficiario') {
						pagamento.ordinaisContratuais = requisicao.honorarios
							.map((honorario, ordinal) => ({ ordinal, honorario }))
							.filter(
								({ honorario: { tipoHonorario } }) =>
									tipoHonorario === 'Honorários Contratuais'
							)
							.filter(
								({
									honorario: { beneficiario: nomeBeneficiarioContratuais },
								}) =>
									pagamento.nome.toUpperCase() ===
									nomeBeneficiarioContratuais.toUpperCase()
							)
							.map(({ ordinal }) => ordinal);
					} else if (tipo === 'honorario') {
						if (pagamento.tipoHonorario === 'Honorários Contratuais') {
							pagamento.maybeOrdinalBeneficiario = requisicao.beneficiarios
								.map((beneficiario, ordinal) => ({ ordinal, beneficiario }))
								.filter(
									({ beneficiario: { nome } }) =>
										pagamento.beneficiario.toUpperCase() === nome.toUpperCase()
								)
								.map(({ ordinal }) => ordinal);
						}
					}
					return {
						tipo,
						ordinal,
						pagamento,
						prefixo: `gm-requisicao__${tipo}--${ordinal}`,
					};
				});
			})
		);

		const total = pagamentos.reduce(
			(soma, { pagamento }) => soma + pagamento.valor.total,
			0
		);
		this.validarElemento(
			'.gm-requisicao__dados__valorTotalRequisitado',
			requisicao.valorTotalRequisitado === Utils.round(total, 2)
		);

		const LIMITE = 60 * SALARIO_MINIMO;

		pagamentos.forEach(({ tipo, pagamento, prefixo }) => {
			// Destacar campos que requerem atenção
			this.validarElemento(
				`.${prefixo}__bloqueado`,
				tipo === 'honorario' &&
					pagamento.tipoHonorario === 'Devolução à Seção Judiciária' ||
					undefined
			);
			if ('tipoJuros' in pagamento) {
				this.validarElemento(
					`.${prefixo}__tipoJuros`,
					ehPrevidenciario && pagamento.tipoJuros === 'Poupança' ||
						tipo === 'honorario' &&
							pagamento.tipoHonorario === 'Devolução à Seção Judiciária' &&
							pagamento.tipoJuros === 'Não incidem' ||
						undefined
				);
			}

			if ('naturezaTributaria' in pagamento) {
				this.validarElemento(
					`.${prefixo}__naturezaTributaria`,
					ehTributario === pagamento.naturezaTributaria
				);
			}

			switch (pagamento.codigoTipoDespesa) {
				case '11':
					codigoNaturezaCorreto = ehServidor;
					break;

				case '12':
					codigoNaturezaCorreto = ehPrevidenciario;
					break;

				case '31':
				case '39':
					codigoNaturezaCorreto = ehDesapropriacao;
					break;

				case '21':
					codigoNaturezaCorreto =
						ehTributario ||
						tipo === 'honorario' &&
							pagamento.tipoHonorario === 'Devolução à Seção Judiciária' ||
						undefined;
					break;
			}
			this.validarElemento(
				`.${prefixo}__codigoTipoDespesa`,
				codigoNaturezaCorreto
			);

			if (tipo === 'beneficiario' && pagamento.especie.match(/^RPV/) === null) {
				this.validarElemento(`.${prefixo}__doencaGrave`, undefined);
			}
			if (tipo === 'beneficiario') {
				// Conferir se valor do IRPF corresponde à quantia que o beneficiário irá receber
				if (pagamento.irpf) {
					let irpf = 0;
					if (pagamento.valorAnterior) {
						irpf += pagamento.valorAnterior;
					}
					if (pagamento.valorCorrente) {
						irpf += pagamento.valorCorrente;
					}
					const valorIRPFConfere =
						Utils.round(irpf, 2) === pagamento.valor.total;
					this.validarElemento(`.${prefixo}__valorCorrente`, valorIRPFConfere);
					this.validarElemento(`.${prefixo}__valorAnterior`, valorIRPFConfere);
				}

				const valorIncluindoContratuais = [pagamento.valor.total]
					.concat(
						...pagamento.ordinaisContratuais
							.map(ordinal => requisicao.honorarios[ordinal])
							.map(honorario => honorario.valor.total)
					)
					.reduce((soma, valor) => soma + valor, 0);
				const ultrapassaLimite = valorIncluindoContratuais / LIMITE > 0.99;

				if (pagamento.especie.match(/^RPV/) !== null) {
					this.validarElemento(
						`.${prefixo}__renunciaValor`,
						pagamento.renunciaValor === ultrapassaLimite
					);
					this.validarElemento(`.${prefixo}__especie`, ! ultrapassaLimite);
				} else {
					this.validarElemento(
						`.${prefixo}__especie`,
						ultrapassaLimite || undefined
					);
				}
			} else if (tipo === 'honorario') {
				if (pagamento.tipoHonorario === 'Honorários Contratuais') {
					// Conferir se os dados do contratante estão corretos
					this.validarElemento(
						`.${prefixo}__beneficiario`,
						pagamento.maybeOrdinalBeneficiario.length === 1
					);
					pagamento.maybeOrdinalBeneficiario
						.map(ord => requisicao.beneficiarios[ord])
						.forEach(beneficiario => {
							// Conferir se data-base dos honorários contratuais é a mesma do valor principal
							this.validarElemento(
								`.${prefixo}__dataBase`,
								beneficiario.dataBase.getTime() === pagamento.dataBase.getTime()
							);
							// Conferir se razão entre principal e juros dos honorários contratuais é a mesma do valor do beneficiário
							this.validarElemento(
								`.${prefixo}__valor`,
								Math.abs(
									beneficiario.valor.juros / beneficiario.valor.principal -
										pagamento.valor.juros / pagamento.valor.principal
								) <= 0.0001
							);
						});

					const valorIncluindoBeneficiario = [pagamento.valor.total]
						.concat(
							...pagamento.maybeOrdinalBeneficiario
								.map(ord => requisicao.beneficiarios[ord])
								.map(beneficiario => beneficiario.valor.total)
						)
						.reduce((soma, valor) => soma + valor, 0);
					const ultrapassaLimite = valorIncluindoBeneficiario / LIMITE > 0.99;

					if (pagamento.especie.match(/^RPV/) !== null) {
						this.validarElemento(
							`.${prefixo}__renunciaValor`,
							pagamento.renunciaValor === ultrapassaLimite
						);
						this.validarElemento(`.${prefixo}__especie`, ! ultrapassaLimite);
					} else {
						this.validarElemento(
							`.${prefixo}__especie`,
							ultrapassaLimite || undefined
						);
					}
				} else {
					const ultrapassaLimite = pagamento.valor.total / LIMITE > 0.99;
					if (pagamento.especie.match(/^RPV/) !== null) {
						this.validarElemento(
							`.${prefixo}__renunciaValor`,
							pagamento.renunciaValor === ultrapassaLimite
						);
						this.validarElemento(`.${prefixo}__especie`, ! ultrapassaLimite);
					} else {
						this.validarElemento(
							`.${prefixo}__especie`,
							ultrapassaLimite || undefined
						);
					}
				}
			}
		});
	}
}

