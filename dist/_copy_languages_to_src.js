
/* global module, __dirname */

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

function run(paths) {
	if (paths.dir) {
		var dirPathNew = path.resolve(paths.dir);
		if (paths.dirs) {
			for (var i in paths.dirs) {
				var dir = paths.dirs[i];
				var dirPath = path.resolve(dir.path);
				console.log(dirPath);
				if (fs.existsSync(dirPath)) {
					var fileNames = fs.readdirSync(dirPath);
					console.log(fileNames);
					for (var j = 0; j < fileNames.length; j++) {
						var fileName = fileNames[j];
						if (dir.exclude && is_exclude(fileName, dir.exclude)) {
							continue;
						}
						if (dir.include && !is_include(fileName, dir.include)) {
							continue;
						}
						var filePath = path.resolve(dirPath, fileName);
						var filePathNew = path.resolve(dirPathNew, fileName);
						fse.copySync(filePath, filePathNew);
					}
				}
			}
		}
	}
}

function is_include(str, includes) {
	var result = false;
	for (var i in includes) {
		if (includes[i].test(str)) {
			result = true;
		}
	}
	return result;
}

function is_exclude(str, excludes) {
	var result = false;
	for (var i in excludes) {
		if (excludes[i].test(str)) {
			result = true;
		}
	}
	return result;
}

if (module.parent) {
	exports.run = run;
}
//else {
//	var paths = {
//		dir: path.resolve(__dirname,'../src/wp-languages/'),
//		dirs: [
//			{
//				path: path.resolve('/domains/euni.ru.old/wp-content/themes/euni/languages'),
//				include: [/\.pot$/]
//			},
//			{
//				path: path.resolve('/domains/euni.ru.old/wp-content/languages/loco/themes'),
//				include: [/tgrwb_euni.*\.po$/, /tgrwb_euni.*\.mo$/]
//			}
//		]
//	};
//	run(paths);
//}
