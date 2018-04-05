type Fn<T, U> = (_: T) => U;
type Nullable<T> = T | null | undefined;
type NullableFn<T, U> = Fn<T, Nullable<U>>;

export default function safePipe<A, B>(obj: Nullable<A>, fab: Fn<A, B>): B;
export default function safePipe<A, B, C>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: Fn<B, C>
): C;
export default function safePipe<A, B, C, D>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: Fn<C, D>
): D;
export default function safePipe<A, B, C, D, E>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: Fn<D, E>
): E;
export default function safePipe<A, B, C, D, E, F>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: Fn<E, F>
): F;
export default function safePipe<A, B, C, D, E, F, G>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: Fn<F, G>
): G;
export default function safePipe<A, B, C, D, E, F, G, H>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>,
	fgh: Fn<G, H>
): H;
export default function safePipe<A, B, C, D, E, F, G, H, I>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>,
	fgh: NullableFn<G, H>,
	fhi: Fn<H, I>
): I;
export default function safePipe<A, B, C, D, E, F, G, H, I, J>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>,
	fgh: NullableFn<G, H>,
	fhi: NullableFn<H, I>,
	fij: Fn<I, J>
): J;
export default function safePipe<A, B, C, D, E, F, G, H, I, J, K>(
	obj: Nullable<A>,
	fab: NullableFn<A, B>,
	fbc: NullableFn<B, C>,
	fcd: NullableFn<C, D>,
	fde: NullableFn<D, E>,
	fef: NullableFn<E, F>,
	ffg: NullableFn<F, G>,
	fgh: NullableFn<G, H>,
	fhi: NullableFn<H, I>,
	fij: NullableFn<I, J>,
	fjk: Fn<J, K>
): K;
export default function safePipe(obj, ...fns) {
	return fns.reduce((x, f) => (x == null ? null : f(x)), obj);
}
