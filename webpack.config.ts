import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import userscript from 'userscript-meta';
import webpack from 'webpack';
import metadata from './metadata';

interface PackageJson {
	name: string;
	version: string;
	description?: string;
}

const pkg: PackageJson = require('./package.json'); // Otherwise TypeScript will complain

const config = (env: { production: boolean } = { production: false }): webpack.Configuration => ({
	mode: 'none',
	optimization: { usedExports: true },
	devtool: env.production ? undefined : 'inline-source-map',
	entry: path.resolve(__dirname, 'src', 'index.ts'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: `${pkg.name}.user.js`,
	},
	module: {
		rules: [
			{ test: /\.[jt]s$/, use: ['ts-loader'], sideEffects: false },
			{ test: /\.(html|css)$/, use: ['raw-loader'], sideEffects: false },
		],
	},
	resolve: {
		extensions: ['.js', '.ts'],
	},
	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		hot: false,
		open: true,
	},
	plugins: [
		...(env.production ? [new TerserPlugin()] : []),
		new webpack.BannerPlugin({
			banner: generateBanner(),
			raw: true,
		}),
	],
});

function generateBanner() {
	const { name, version, description } = pkg;
	const data = {
		name,
		version,
		...(description ? { description } : {}),
		...metadata,
	};
	return userscript.stringify(data);
}

export default config;
