type Nullable<T> = T | null | undefined;
type NullableFn<T, U> = (_: T) => Nullable<U>;

export default function safePipe<A, B>(
	obj: A,
	fab: NullableFn<A, B>
): Nullable<B>;
export default function safePipe<A, B, C>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>
): Nullable<C>;
export default function safePipe<A, B, C, D>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>
): Nullable<D>;
export default function safePipe<A, B, C, D, E>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>
): Nullable<E>;
export default function safePipe<A, B, C, D, E, F>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>
): Nullable<F>;
export default function safePipe<A, B, C, D, E, F, G>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>
): Nullable<G>;
export default function safePipe<A, B, C, D, E, F, G, H>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>,
	fgh: NullableFn<G, H>
): Nullable<H>;
export default function safePipe<A, B, C, D, E, F, G, H, I>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>,
	fgh: NullableFn<G, H>,
	fhi: NullableFn<H, I>
): Nullable<I>;
export default function safePipe<A, B, C, D, E, F, G, H, I, J>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>,
	fgh: NullableFn<G, H>,
	fhi: NullableFn<H, I>,
	fij: NullableFn<I, J>
): Nullable<J>;
export default function safePipe<A, B, C, D, E, F, G, H, I, J, K>(
	obj: A,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>,
	fgh: NullableFn<G, H>,
	fhi: NullableFn<H, I>,
	fij: NullableFn<I, J>,
	fjk: NullableFn<J, K>
): Nullable<K>;
export default function safePipe(...args: any[]) {
	return args.reduce((x, f) => (x ? f(x) : null));
}
