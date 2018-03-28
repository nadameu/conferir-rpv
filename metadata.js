export default {
	name: 'Precatórios/RPVs',
	description: 'Auxilia a conferência de RPVs e precatórios.',
	namespace: 'http://nadameu.com.br/precatorios-rpv',
	include: [
		/^https:\/\/eproc\.(trf4|jf(pr|rs|sc))\.jus\.br\/eproc(2trf4|V2)\/controlador\.php\?acao=processo_selecionar\&/,
		/^https:\/\/eproc\.(trf4|jf(pr|rs|sc))\.jus\.br\/eproc(2trf4|V2)\/controlador\.php\?acao=processo_precatorio_rpv\&/,
		/^https:\/\/eproc\.(trf4|jf(pr|rs|sc))\.jus\.br\/eproc(2trf4|V2)\/controlador\.php\?acao=oficio_requisitorio_visualizar\&/,
	],
	grant: 'GM_xmlhttpRequest',
};
