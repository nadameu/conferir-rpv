export interface Conversor<T> {
	converter: (valor: T) => string;
}

export interface Analisador<T> {
	analisar: (texto: string) => T;
}

type AnalisadorConversor<T> = Analisador<T> & Conversor<T>;

export default AnalisadorConversor;
