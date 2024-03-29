const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// Плагин необходим! Он отвечает за клонирование любых других правил, которые вы определили, чтобы применить их к соответствующим языковым блокам в файлах .vue. Например, если у вас есть правило, соответствующее файлам /\.js$/, оно будет применяться к секциям <script> в файлах .vue.
const VueLoaderPlugin = require('vue-loader/lib/plugin');

// чтоб менять пути в одном месте
const PATHS = {
	// ../ т.к. конфиги в своей папке build
	src: path.join(__dirname, '../src'),
	dist: path.join(__dirname, '../dist'),
	assets: 'assets/',
};

module.exports = {
	// это чтоб переменные путей были доступны в других конфиг. файлах
	externals: {
		paths: PATHS
	},
	entry: {
		//читать как app: "./src/" - webpack поймет что обращение к index.js
		app: PATHS.src,
		lk: `${PATHS.src}/lk.js`,
		// еще можно просто большой файл скрипта разбить, еще лучше асинхронно
	},
	output: {
		// filename: "[name].js", <-можно так, будет складывать в дист
		// читать: filename: 'assets/js/[name].js'
		filename: `${PATHS.assets}js/[name].[hash:4].js`,
		path: PATHS.dist,
		publicPath: "/"
	},
	module: {
		rules: [
			// это будет применяться к файлам `.js`
			// А ТАКЖЕ к секциям `<script>` внутри файлов `.vue`
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: '/node_modules/'
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				// for compile scss
				options: {
					loader:{
						scss: 'vue-style-loader!css-loader!sass-loader'
					}
				}
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 15000,
					}
				}
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
						}
					}
				],
			},
			// это будет применяться к файлам `.css`
			// А ТАКЖЕ к секциям `<style>` внутри файлов `.vue`
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: '../'
						}
					},
					'css-loader',
					{
						loader: "postcss-loader",
						options: {
							sourceMap: true,
							// файл с настройками плагина
							// config: {
							// 	path: `${PATHS.src}/js/postcss.config.js`
							// }
						}
					}
				],
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							sourceMap: true,
						}
					},
					{
						loader: "postcss-loader",
						options: {
							sourceMap: true,
							// файл с настройками плагина
							// config: {
							// 	path: `${PATHS.src}/js/postcss.config.js`
							// }
						}
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true,
						}
					}
				]
			},
			// подключение шрифтов
			{
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				loader: "file-loader",
				options: {
					name: '[name].[ext]'
				}
			}
		]
	},
	resolve: {
		alias: {
			// фишка для либ, чтоб везде использовать короткий путь
			'~': 'src',
			'vue$': 'vue/dist/vue.js',
		}
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: `${PATHS.assets}css/[name].[hash:4].css`, // dist/assets/css/[name].css
			//chunkFilename: '[id].css'
		}),
		new HtmlWebpackPlugin({
			hash: false, // false default
			template: `${PATHS.src}/index.html`,
			filename: "index.html",
			// disable/enable automatic inject scripts and styles in html file
			inject: true
		}),
		// копирует статичные файлы из src в dist/assets
		new CopyWebpackPlugin([
			// читать как { from: `src/assets/img`, to: `dist/assets/img` },
			{ from: `${PATHS.src}/${PATHS.assets}/img`, to: `${PATHS.assets}img` },
			{ from: `${PATHS.src}/${PATHS.assets}/fonts`, to: `${PATHS.assets}fonts` },
			{ from: `${PATHS.src}/static`, to: '' },
		]),
		new VueLoaderPlugin(),
	],
	optimization: {
		// разбивка на чанки
		splitChunks: {
			// определение чанков
			cacheGroups: {
				// определение чанка с либами
				vendor: {
					name: 'vendors',
					// забирать из node_modules
					test: /node_modules/,
					chunks: "all",
					enforce: true
				}
			}
		}
	}
};