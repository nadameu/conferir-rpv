import Pagina from './Pagina';

function main() {
	const pagina = Pagina.analisar(document);
	if (typeof pagina !== 'undefined') {
		pagina.adicionarAlteracoes();
	}
}

main();
