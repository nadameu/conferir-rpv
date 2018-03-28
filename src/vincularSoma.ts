import { arredondarMoeda, formatarMoeda } from './moeda';
import obterValores from './obterValores';

const vincularSoma = (
	elementoPrincipal: HTMLInputElement,
	elementoJuros: HTMLInputElement,
	elementoTotal: HTMLInputElement
) => {
	const obterValoresElementos = () =>
		obterValores([elementoPrincipal, elementoJuros, elementoTotal]);

	const preencherAutomaticamente = () => {
		const [principal, juros, total] = obterValoresElementos();
		if (total && !principal) {
			elementoPrincipal.value = formatarMoeda(arredondarMoeda(total - juros));
		} else if (total && !juros) {
			elementoJuros.value = formatarMoeda(arredondarMoeda(total - principal));
		}
	};

	const validarSoma = () => {
		const [principal, juros, total] = obterValoresElementos();
		if (arredondarMoeda(principal + juros) !== total) {
			elementoJuros.classList.add('gm-digitar-rpv__input_error');
		} else {
			elementoJuros.classList.remove('gm-digitar-rpv__input_error');
		}
	};

	[elementoPrincipal, elementoJuros, elementoTotal].forEach(el =>
		el.addEventListener('blur', () => {
			preencherAutomaticamente();
			validarSoma();
		})
	);

	validarSoma();
};
export default vincularSoma;
