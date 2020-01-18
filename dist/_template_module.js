/*
 * Создание файлов для модулей.
 *
 * Порядок использования.
 *
 * 1. Создаём нужную директорию в родительских директориях:
 * wp, wp-modules, wp-plugins, wp-post_types, wp-taxonomies или wp-themes.
 *
 * 2. Скопировать в директорию файлы admin/__clear.js и admin/__update.js.
 *
 * 3. Запустить файл __update.js.
 * При запуске создаются пустые файлы с соответствующими именами.
 *
 * 4. В нужных файлах вносятся изменения.
 *
 * 5. Для удаления лишних пустых файлов используется скрипт __clear.js
 *
 * !!! Чтобы .php файлы не удалились автотматически при использовании скрипта __clear.js,
 * !!! необходимо УДАЛИТЬ из них комментарий со словом "void".
 * !!! Даже отредактированные  .php файлы содержащие "void" будут удалени без возможности восстановить.
 *
 */

/* global module, __dirname, __filename */

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
/**
 *
 * @param {string} pathToDir
 * @param {string} pathToParamFile
 * @returns {undefined}
 */
function create(pathToDir, pathToParamFile) {
	const params = (pathToParamFile) ? require(pathToParamFile) : {};
	const {_void_, contentPhpNamespace, contentJs, contentOtherJs, contentLess, fileTemplates} = require('./_template_module_params_default.js').getParams(params);
	var name = pathToDir.replace(/^.*\//, '').replace(/^.*\\/, '');
	var classNameA = name.split('-');
	var className = '';
	var traitName = 'traitFor';
	for (var i = 0; i < classNameA.length; i++) {
		if (i) {
			className += classNameA[i].substring(0, 1).toUpperCase() + classNameA[i].substring(1).toLowerCase();
			traitName += classNameA[i].substring(0, 1).toUpperCase() + classNameA[i].substring(1).toLowerCase();
		} else {
			className += classNameA[i].toLowerCase();
		}
	}
	var nameForJs = classNameA.join('_').replace(/^tgrwb_/, '');
	var baseClass = 'tgrwb-' + className.substring(5, 6).toLowerCase() + className.substring(6);
	console.log(classNameA);
	console.log(className);
	console.log(traitName);
	for (var i in fileTemplates) {
		if (fileTemplates[i].name) {
			var fileName = fileTemplates[i].name.replace(/\{name\}/g, name);
			fileName = fileTemplates[i].is_shortcode
					? fileName.replace(/-/g, '_')
					: fileName;
			var filePath = path.resolve(pathToDir, fileName);
			var content = fileTemplates[i].content
					.replace(/\{###contentPhpNamespace###\}/g, contentPhpNamespace)
					.replace(/\{###contentJs###\}/g, contentJs)
					.replace(/\{###contentOtherJs###\}/g, contentOtherJs)
					.replace(/\{###contentLess###\}/g, contentLess)
					.replace(/\{###_void_###\}/g, _void_)
					.replace(/\{class\}/g, className)
					.replace(/\{trait\}/g, traitName)
					.replace(/\{name_for_js\}/g, nameForJs)
					.replace(/\{base_class\}/g, baseClass)
					.replace(/\{name_shortcode\}/g, 'tgrwb_' + nameForJs)
					;
			if (!fs.existsSync(filePath)) {
				try {
					fse.accessSync(path.resolve(filePath, '..'), fse.constants.R_OK | fse.constants.W_OK);
				} catch (err) {
					fse.mkdirSync(path.resolve(filePath, '..'), {recursive: true});
				}
				fs.writeFileSync(filePath, content);
			}
			console.log(filePath);
		}
	}
}
/**
 *
 * @param {string} pathToDir
 * @param {string} pathToParamFile
 * @returns {undefined}
 */
function update(pathToDir, pathToParamFile) {
	clear(pathToDir, pathToParamFile);
	create(pathToDir, pathToParamFile);
}
/**
 *
 * @param {string} pathToDir
 * @param {string} pathToParamFile
 * @returns {undefined}
 */
function clear(pathToDir, pathToParamFile) {
	const params = (pathToParamFile) ? require(pathToParamFile) : {};
	const _void_regexp_ = require('./_template_module_params_default.js').getVoidRegexp(params);
	var reg = new RegExp(_void_regexp_);
	if (fs.existsSync(pathToDir) && fs.statSync(pathToDir).isDirectory()) {
		var files = fs.readdirSync(pathToDir);
		for (var i in files) {
			var fileName = path.resolve(pathToDir, files[i]);
			console.log(fileName);
			if (fs.statSync(fileName).isFile()) {
				var needToRemove = false;
				if (!fs.statSync(fileName).size) {
					console.log('DEL - ' + fileName);
					needToRemove = true;
				} else {
					var content = fs.readFileSync(fileName, {encoding: 'utf-8'});
					if (reg.test(content)) {
						console.log('VOID - ' + fileName);
						needToRemove = true;
					} else {
//						console.log(fileName);
					}
				}
				if (needToRemove) {
					fs.unlinkSync(fileName);
				}
			} else if (fs.statSync(fileName).isDirectory()) {
				clear(fileName, pathToParamFile);
			}
		}
	}
}
/**
 *
 * @param {string} pathToDir
 * @param {string} pathToParamFile
 * @returns {undefined}
 */
function add(pathToDir, pathToParamFile) {
	const pathToParamFileStr = (pathToParamFile) ? ', \'' + pathToParamFile.replace(/\\/g, '/') + '\'' : '';
	var files = {
		'__clear.js': 'require(\'@tgrwb/js-dev-tools/dist/_template_module.js\').clear(__dirname' + pathToParamFileStr + ');',
		'__update.js': 'require(\'@tgrwb/js-dev-tools/dist/_template_module.js\').update(__dirname' + pathToParamFileStr + ');'
	};
	for (var i  in files) {
		var fileName = path.resolve(pathToDir, i);
		try {
			fs.accessSync(pathToDir, fs.constants.R_OK | fs.constants.W_OK);
			fs.writeFileSync(fileName, files[i]);
		} catch (err) {
		}
	}
}
/**
 *
 * @param {string} pathToDir
 * @returns {undefined}
 */
function remove(pathToDir) {
	var files = {
		'__clear.js': '',
		'__update.js': ''
	};
	for (var i  in files) {
		var fileName = path.resolve(pathToDir, i);
		try {
			fs.accessSync(fileName, fs.constants.R_OK | fs.constants.W_OK);
			fs.unlinkSync(fileName);
		} catch (err) {
		}
	}
}

if (module.parent) {
	exports.create = create;
	exports.update = update;
	exports.clear = clear;
	exports.add = add;
	exports.remove = remove;
} else {
//	var name = __filename.replace(/^.*\//, '').replace(/^.*\\/, '').replace(/\..*$/, '');
//	var pathToDir = path.resolve(__dirname, name);
//	create(pathToDir, name);
}
