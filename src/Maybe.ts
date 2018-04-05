export abstract class Maybe<A> {
	abstract maybe<B>(b: B, f: (_: A) => B): B;
	ap<B>(fab: Maybe<{ (_: A): B }>): Maybe<B> {
		return fab.chain(f => this.map(f));
	}
	chain<B>(f: (_: A) => Maybe<B>): Maybe<B> {
		return this.maybe(nothing(), f);
	}
	chainNullable<B>(f: (_: A) => B | null | undefined): Maybe<B> {
		return this.chain(a => Maybe.fromNullable(f(a)));
	}
	map<B>(f: (_: A) => B): Maybe<B> {
		return this.maybe(nothing(), a => Maybe.of(f(a)));
	}
	toArray<B>(this: Maybe<B | B[]>): B[] {
		return this.maybe([], xs => (Array.isArray(xs) ? xs : [xs]));
	}
	static fromArray<T>(xs: T[]): Maybe<T> {
		return xs.length === 0 ? nothing() : just(xs[0]);
	}
	static fromNullable<T>(x: T | null | undefined): Maybe<T> {
		return x == null ? nothing() : just(x);
	}
	static of<T>(x: T): Maybe<T> {
		return new Just(x);
	}

	static sequence<A>(maybes: [Maybe<A>]): Maybe<[A]>;
	static sequence<A, B>(maybes: [Maybe<A>, Maybe<B>]): Maybe<[A, B]>;
	static sequence<A, B, C>(
		maybes: [Maybe<A>, Maybe<B>, Maybe<C>]
	): Maybe<[A, B, C]>;
	static sequence<A, B, C, D>(
		maybes: [Maybe<A>, Maybe<B>, Maybe<C>, Maybe<D>]
	): Maybe<[A, B, C, D]>;
	static sequence<A, B, C, D, E>(
		maybes: [Maybe<A>, Maybe<B>, Maybe<C>, Maybe<D>, Maybe<E>]
	): Maybe<[A, B, C, D, E]>;
	static sequence<A, B, C, D, E, F>(
		maybes: [Maybe<A>, Maybe<B>, Maybe<C>, Maybe<D>, Maybe<E>, Maybe<F>]
	): Maybe<[A, B, C, D, E, F]>;
	static sequence<A, B, C, D, E, F, G>(
		maybes: [
			Maybe<A>,
			Maybe<B>,
			Maybe<C>,
			Maybe<D>,
			Maybe<E>,
			Maybe<F>,
			Maybe<G>
		]
	): Maybe<[A, B, C, D, E, F, G]>;
	static sequence<A, B, C, D, E, F, G, H>(
		maybes: [
			Maybe<A>,
			Maybe<B>,
			Maybe<C>,
			Maybe<D>,
			Maybe<E>,
			Maybe<F>,
			Maybe<G>,
			Maybe<H>
		]
	): Maybe<[A, B, C, D, E, F, G, H]>;
	static sequence<A, B, C, D, E, F, G, H, I>(
		maybes: [
			Maybe<A>,
			Maybe<B>,
			Maybe<C>,
			Maybe<D>,
			Maybe<E>,
			Maybe<F>,
			Maybe<G>,
			Maybe<H>,
			Maybe<I>
		]
	): Maybe<[A, B, C, D, E, F, G, H, I]>;
	static sequence<A, B, C, D, E, F, G, H, I, J>(
		maybes: [
			Maybe<A>,
			Maybe<B>,
			Maybe<C>,
			Maybe<D>,
			Maybe<E>,
			Maybe<F>,
			Maybe<G>,
			Maybe<H>,
			Maybe<I>,
			Maybe<J>
		]
	): Maybe<[A, B, C, D, E, F, G, H, I, J]>;
	static sequence<T>(maybes: Maybe<T>[]): Maybe<T[]>;
	static sequence(maybes: Maybe<any>[]) {
		return Maybe.traverse(x => x, maybes);
	}

	static traverse<A, B>(f: (_: A) => Maybe<B>, xs: A[]): Maybe<B[]> {
		return xs.reduce(
			(fys: Maybe<B[]>, x) => fys.chain(ys => f(x).map(y => (ys.push(y), ys))),
			Maybe.of([])
		);
	}
}
export default Maybe;

export class Nothing extends Maybe<never> {
	inspect() {
		return this.toString();
	}
	maybe<B>(b: B, _: any): B {
		return b;
	}
	toString() {
		return `Nothing`;
	}
}
const _nothing = new Nothing();
export const nothing = () => _nothing;

export class Just<A> extends Maybe<A> {
	constructor(private readonly value: A) {
		super();
	}
	inspect() {
		return this.toString();
	}
	maybe<B>(_: B, f: (a: A) => B): B {
		return f(this.value);
	}
	toString() {
		return `Just(${this.value})`;
	}
}
export const just = <T>(x: T) => new Just(x);

const z = Array.from({ length: 11 }, (_, i) => i)
	.map(length => {
		const tipos = Array.from({ length }, (_, i) => String.fromCharCode(65 + i));
		const maybes = tipos.map(T => `Maybe<${T}>`);
		return `static sequence<${tipos.join(',')}>(maybes: [${maybes.join(
			','
		)}]): Maybe<[${tipos.join(',')}]>`;
	})
	.join('\n');
z;
