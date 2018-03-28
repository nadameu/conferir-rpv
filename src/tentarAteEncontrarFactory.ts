const tentarAteEncontrarFactory = (
	obterElementos: (ids: string[]) => Promise<HTMLElement[]>
) => (ids: string[]): Promise<HTMLElement[]> =>
	new Promise(resolve => {
		const timer = setInterval(() => {
			obterElementos(ids).then(
				els => {
					clearInterval(timer);
					resolve(els);
				},
				() => {
					// just wait
				}
			);
		}, 100);
	});

export default tentarAteEncontrarFactory;
