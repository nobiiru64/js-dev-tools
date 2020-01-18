/*
 * Упаковка плагина в дистрибутив
 */

/* global module */
function run(params) {
	const path = require('path');
	const fse = require('fs-extra');
	const sd = require('sync-directory');
	if (params.distPath) {
		try {
			fse.accessSync(params.distPath, fse.constants.R_OK | fse.constants.W_OK);
		} catch (err) {
			fse.mkdirSync(params.distPath, {recursive: true});
			console.log('*** mkdirSync - ' + params.distPath);
		}
		for (var i in params.dirs) {
			var srcPath = path.resolve(params.srcPath, params.dirs[i].src);
			var distPath = path.resolve(params.distPath, params.dirs[i].dist);
			sd(srcPath, distPath, {
				watch: params.dirs[i].watch || false,
				type: params.dirs[i].type || 'copy',
				deleteOrphaned: ((false === params.dirs[i].deleteOrphaned) ? false : true),
				exclude: params.dirs[i].exclude || null
			});
		}
	}
}

if (module.parent) {
	exports.run = run;
} else {
//	var params = {
//		srcPath: path.resolve(__dirname, 'src'),
//		distPath: path.resolve(__dirname, 'dist/mu-plugins'),
//		dirs: [
//			{
//				src: '.',
//				dist: '.',
//				watch: false,
//				type: 'copy',
//				deleteOrphaned: true
//			},
//			{
//				src: 'vendor',
//				dist: 'htmlburger--carbon-fields/vendor',
//				watch: false,
//				type: 'copy',
//				deleteOrphaned: true
//			}
//		]
//	};
}

