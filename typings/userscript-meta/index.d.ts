declare module 'userscript-meta' {
	export function parse(meta: string): Object;
	export function stringify(obj: Object): string;
}
