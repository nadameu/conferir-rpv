const obterElementosFactory = (doc: Document) => {
	const byId = (id: string) => {
		const element = doc.getElementById(id);
		return element ? Promise.resolve(element) : Promise.reject(id);
	};
	return (ids: string[]) => Promise.all(ids.map(byId));
};

export default obterElementosFactory;
