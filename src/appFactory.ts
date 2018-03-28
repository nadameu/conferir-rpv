import formulario from './formulario.html';
import vincularSoma from './vincularSoma';
import preencherFormulario from './preencherFormulario';

const divs = ['divCalcValsBrutos'];
const inputs = [
	'txtValorBruto',
	'txtValorBrutoPrincipal',
	'txtValorBrutoJurosSelic',
	'gm-digitar-rpv__ex-corrente',
	'gm-digitar-rpv__ex-anterior',
	'txtValorTotal',
	'txtValorPrincipal',
	'txtValorJuros',
	'txtValorExCorrente',
	'txtValorExAnterior',
];
const buttons = ['btnAplicarCalcValsBrutos'];

const appFactory = (
	limparTabIndex: () => void,
	tentarAteEncontrar: (ids: string[]) => Promise<HTMLElement[]>,
	tentarAteEncontrarComValor: (ids: string[]) => Promise<HasValue[]>
) => () => {
	return tentarAteEncontrar(divs).then(([div]) => {
		div.insertAdjacentHTML('beforeend', formulario);
		return Promise.all([
			tentarAteEncontrar(buttons),
			tentarAteEncontrarComValor(inputs),
		]).then(([buttons, inputs]) => {
			const [aplicar] = buttons as HTMLButtonElement[];
			const [
				inputBrutoTotal,
				inputBrutoPrincipal,
				inputBrutoJuros,
				inputBrutoCorrente,
				inputBrutoAnterior,
				inputTotal,
				inputPrincipal,
				inputJuros,
				inputCorrente,
				inputAnterior,
			] = inputs as HTMLInputElement[];
			limparTabIndex();
			vincularSoma(inputBrutoPrincipal, inputBrutoJuros, inputBrutoTotal);
			vincularSoma(inputPrincipal, inputJuros, inputTotal);
			preencherFormulario(
				inputBrutoTotal,
				[inputCorrente, inputAnterior],
				[inputBrutoCorrente, inputBrutoAnterior]
			);
			aplicar.addEventListener('click', () => {
				preencherFormulario(
					inputTotal,
					[inputBrutoCorrente, inputBrutoAnterior],
					[inputCorrente, inputAnterior]
				);
			});
		});
	});
};

export default appFactory;
