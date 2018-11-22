import jsc from 'jsverify';
import ConversorBool from './ConversorBool';
test('ConversorBool', () => {
	jsc.assertForall(
		jsc.oneof([jsc.constant('Sim'), jsc.constant('Não')]),
		bool => ConversorBool.converter(ConversorBool.analisar(bool)) === bool
	);
});
