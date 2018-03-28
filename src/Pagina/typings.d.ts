interface PaginaComAlteracoes {
	doc: Document;
	adicionarAlteracoes(): void;
	validarElemento(
		selector: string,
		condicao?: boolean,
		classeTrue?: string,
		classeFalse?: string,
		classeUndefined?: string
	): void;
}

interface PaginaComAlteracoesConstructor {
	new (doc: Document): PaginaComAlteracoes;
}
