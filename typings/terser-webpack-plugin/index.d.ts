declare module 'terser-webpack-plugin' {
	export default class terser_webpack_plugin {
		constructor(...args: any[]);

		apply(...args: any[]): void;

		static buildError(...args: any[]): void;

		static buildSourceMap(...args: any[]): void;

		static buildWarning(...args: any[]): void;

		static isSourceMap(...args: any[]): void;
	}
}
