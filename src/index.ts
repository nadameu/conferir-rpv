import analisar from './Pagina/PaginaFactory';

const estilos = require('./includes/estilos.css');

async function main() {
	GM_addStyle(estilos);
	const pagina = await analisar(document);
	return pagina.adicionarAlteracoes();
}

main().then(x => console.log('Resultado:', x), e => console.error(e));
