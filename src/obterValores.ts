import { parseMoeda } from './moeda';

const obterValor = (elemento: HasValue) => parseMoeda(elemento.value);

const obterValores = (elementos: HasValue[]) => elementos.map(obterValor);

export default obterValores;
