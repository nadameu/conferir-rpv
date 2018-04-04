export function lefts(promises: Iterable<Promise<any>>) {
	return Promise.all(
		Array.from(promises).map(promise => promise.then(_ => [], erro => [erro]))
	).then(xss => xss.flatten());
}

export function rights<T>(promises: Iterable<Promise<T>>) {
	return Promise.all(
		Array.from(promises).map(promise =>
			promise.then(valor => [valor], _ => [] as T[])
		)
	).then(xss => xss.flatten());
}
