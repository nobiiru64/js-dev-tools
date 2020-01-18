/*
 * Упаковка плагина в дистрибутив
 */

/* global module, __dirname, __filename */

/*
 * Образец
 *
 const path = require('path');
 const auto = require('./admin/tools/_require_files.js');
 var defSettings = {
 basePath: path.resolve(__dirname, 'src'),
 targetDir: '',
 // Директории для поиска модулей.
 dirNames: [
 ],
 // Модули, которым надо дать приоритет при подключении.
 moduleNames: [
 ],
 // Окончания названия файла, которые надо подключать.
 fileSuffixes: [
 ],
 // Игнорировать модули.
 ignoreModuleNames: [
 ],
 // Игнорировать файлы.
 ignoreFileNames: [
 ],
 // Дополнительное окончание к названию файла.
 suffix: ''
 };
 run(defTargetDir, defSettings);
 */

const path = require('path');
const fs = require('fs');
/**
 *
 * @param {string}
 * @param {object} params
 * @returns {undefined}
 */
function run(params) {
	if (!params) {
		return;
	}
	/** Fixes for old params names. */
	if (params.basePath) {
		var basePath = params.basePath;
		var targetDir = params.targetDir || '';
	} else {
		var basePath = params.targetDir || '';
		var targetDir = params.targetSave || '';
	}
	var pathForRequire = '.' + targetDir.replace(/[^\/]+\//g, '/..');
	var dirNames = params.dirNames || [];
	var moduleNames = params.moduleNames || [];
	var fileSuffixes = params.fileSuffixes || [];
	var ignoreFileNames = params.ignoreFileNames || [];
	var ignoreModuleNames = params.ignoreModuleNames || [];
	var modules_ = [];
	var files_ = [];
	/** Проходит по списку директорий в поисках добавленных модулей. */
	for (var d in dirNames) {
		var dirName = path.resolve(basePath, dirNames[d]);
		if (fs.existsSync(dirName)) {
			/** Пропустить если установлен файл игнорирования. */
			if (fs.existsSync(path.resolve(dirName, '.tgrwbautoignore'))) {
				continue;
			}
			var scanDir = fs.readdirSync(dirName);
			for (var i = 0; i < scanDir.length; i++) {
				if (!in_array(scanDir[i], moduleNames)) {
					moduleNames.push(scanDir[i]);
				}
			}
		} else {
			fs.mkdirSync(dirName, {recursive: true});
		}
	}
	/** Проходит по списку модулей для сбора путей к файлам. */
	for (var m in moduleNames) {
		/** Игнорирует модули из настроек. */
		if (in_array(moduleNames[m], ignoreModuleNames)) {
			continue;
		}
		/** Проходит по списку директорий. */
		for (var d in dirNames) {
			var scanDir = path.resolve(basePath, dirNames[d]);
			var moduleDir = path.resolve(scanDir, moduleNames[m]);
			if (fs.existsSync(moduleDir)) {
				/** Пропустить если установлен файл игнорирования. */
				if (fs.existsSync(path.resolve(moduleDir, '.tgrwbautoignore'))) {
					continue;
				}
				modules_.push(moduleDir);
				/** Ищет конкретные файлы для подключения. */
				for (var f in fileSuffixes) {
					var moduleFile = path.resolve(moduleDir, moduleNames[m] + fileSuffixes[f]);
					var moduleFileO = moduleFile.replace(basePath, pathForRequire).replace(/\\/g, '/');
					var suffix = fileSuffixes[f].replace(/-+/g, '-');
					files_[suffix] = files_[suffix] ? files_[suffix] : [];
					if (!in_array(moduleFileO, ignoreFileNames) && fs.existsSync(moduleFile) && fs.statSync(moduleFile).size) {
						files_.count = files_.count ? ++files_.count : 1;
						files_[suffix].push(moduleFileO);
					}
				}
				break;
			}
		}
	}
	/** Соханяет в файлы найденные точки подключения модулей. */
	for (var i in files_) {
		var fileContent = "/** Файл генерируется скриптом " + __filename.replace(/^.*[\/\\]/, '') + " !!! НЕ редактировать !!! */\n";
		if (/\.js$/.test(i) && files_[i].length) {
			fileContent += "\nwindow.tgrwbJs._.get('" + i.replace(/-/, '').replace(/\..+$/, '') + "');\n";
			for (var j in files_[i]) {
				var simlink = files_[i][j].replace(/^.*\//, '').replace(/^(.*)--(.*)\..*$/, "$2.$1").replace(/tgrwb-?/, '').replace(/-/g, '_').replace(/(^\.?|\.?$)/g, '');
//				fileContent += "\nwindow.tgrwbJs." + simlink + " =  jQuery.extend(";
//				fileContent += "\n\twindow.tgrwbJs._.get('" + simlink + "')";
//				fileContent += "\n\t, " + "require('" + files_[i][j] + "'));\n";
				fileContent += "\nwindow.tgrwbJs." + simlink + " = require('" + files_[i][j] + "');\n";
			}
		}
		if (/\.less$/.test(i) && files_[i].length) {
			fileContent += "\n@import '" + files_[i].join("';\n@import '") + "';\n";
		}
		if (/^-/.test(i)) {
			var fileName = targetDir ?
					path.resolve(basePath, targetDir, i.replace(/^-(.+)(\..+)$/, "_auto_$1$2")) :
					path.resolve(basePath, i.replace(/^-(.+)(\..+)$/, "_$1/_auto_$1$2"));
			var dirName = path.resolve(fileName, '..');
			params.suffix && (fileName = fileName.replace(/(\.\w+)$/, params.suffix + "$1"));
			console.log(i);
//			console.log(fileName);
//			console.log(path.resolve(fileName, '..'));
//			console.log(fileContent);
			try {
				fs.accessSync(dirName, fs.constants.R_OK | fs.constants.W_OK);
			} catch (err) {
				fs.mkdirSync(dirName, {recursive: true});
			}
			fs.writeFileSync(fileName, fileContent);
			//
			addDefaultFiles(dirName, params);
		}
	}
	setTimeout(function () {}, 10000);
	function in_array(str, arr) {
		return !!~((',' + arr.join(',') + ',').indexOf(',' + str + ','));
	}
	function addDefaultFiles(dirName, params) {
		var files = params.addFiles || [
			{
				'name': 'tgrwb-frontend.js',
				'content': "\n/* auto */\nrequire('./_auto_frontend.js');\n\n/* less */\nrequire('./tgrwb-frontend.less');\n"
			},
			{
				'name': 'tgrwb-frontend.less',
				'content': "\n/* auto */\n@import './_auto_frontend.less';\n"
			},
			{
				'name': 'tgrwb-backend.js',
				'content': "\n/* auto */\nrequire('./_auto_backend.js');\n\n/* less */\nrequire('./tgrwb-backend.less');\n"
			},
			{
				'name': 'tgrwb-backend.less',
				'content': "\n/* auto */\n@import './_auto_backend.less';\n"
			},
			{
				'name': 'tgrwb-login.js',
				'content': "\n/* auto */\nrequire('./_auto_login.js');\n\n/* less */\nrequire('./tgrwb-login.less');\n"
			},
			{
				'name': 'tgrwb-login.less',
				'content': "\n/* auto */\n@import './_auto_login.less';\n"
			},
			{
				'name': 'tgrwb-other.js',
				'content': "\n/* auto */\nrequire('./_auto_other.js');\n"
			}
		];
		if (params.addFilesPlus) {
			[].push.apply(files, params.addFilesPlus);
		}
		/*  */
		for (var i in files) {
			var fileName = path.resolve(dirName, files[i].name);
			if (!fs.existsSync(fileName)) {
				fs.writeFileSync(fileName, files[i].content);
			}
		}
	}
}

if (module.parent) {
	exports.run = run;
} else {
	console.log('Смотри файл ./../require_files.js');
	console.log('и файл с настройками ./../../tgrwb.config.js');
	setTimeout(function () {}, 10000);
}
