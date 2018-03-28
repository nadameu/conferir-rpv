import { arredondarMoeda, formatarMoeda } from './moeda';
import obterValores from './obterValores';

const preencherFormulario = (
	referencia: HasValue,
	[inA, inB]: HasValue[],
	[outA, outB]: HasValue[]
) => {
	const [valorTotal, valorA, valorB] = obterValores([referencia, inA, inB]);
	const proporcao = valorTotal / (valorA + valorB);
	outA.value = formatarMoeda(arredondarMoeda(valorA * proporcao));
	outB.value = formatarMoeda(arredondarMoeda(valorB * proporcao));
};

export default preencherFormulario;
