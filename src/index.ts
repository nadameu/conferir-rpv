import PaginaFactory from './Pagina/PaginaFactory';

async function main() {
	const pagina = PaginaFactory.analisar(document);
	if (typeof pagina === 'undefined') throw new Error('Página desconhecida.');
	return pagina.adicionarAlteracoes();
}

main().then(x => console.log('Resultado:', x), e => console.error(e));
