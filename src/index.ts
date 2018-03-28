import './estilos.scss';

import appFactory from './appFactory';
import limparTabIndexFactory from './limparTabIndexFactory';
import obterElementosFactory from './obterElementosFactory';
import tentarAteEncontrarComValorFactory from './tentarAteEncontrarComValorFactory';
import tentarAteEncontrarFactory from './tentarAteEncontrarFactory';

const limparTabIndex = limparTabIndexFactory(document);
const obterElementos = obterElementosFactory(document);
const tentarAteEncontrar = tentarAteEncontrarFactory(obterElementos);
const tentarAteEncontrarComValor = tentarAteEncontrarComValorFactory(
	tentarAteEncontrar
);

const app = appFactory(
	limparTabIndex,
	tentarAteEncontrar,
	tentarAteEncontrarComValor
);

app().catch(e => console.error(e));
