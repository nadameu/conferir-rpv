interface HasTabIndex extends Element {
	tabIndex: number;
}

export default function limparTabIndexFactory(doc: Document) {
	return () => {
		Array.from(doc.querySelectorAll('[tabindex]') as NodeListOf<
			HasTabIndex
		>).forEach(el => {
			el.tabIndex = 0;
		});
	};
}
