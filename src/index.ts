import PaginaFactory from './Pagina/PaginaFactory';

function main() {
	const pagina = PaginaFactory.analisar(document);
	if (typeof pagina !== 'undefined') {
		pagina.adicionarAlteracoes();
	}
}

main();
