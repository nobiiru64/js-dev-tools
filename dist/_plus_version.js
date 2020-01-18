
/* global __dirname */

var fs = require('fs');
const path = require('path');
const _plus_version = {};
// Образец.
//var params = {
//	pathStyle: path.resolve(__dirname, './../src/wp-themes/tgrwb-euni/css/style._css'),
//	incrementTpe: 'micro' // major / minor / micro / alpha
//};
_plus_version.css = '';
_plus_version.run = function (params) {
	try {
		this.getCss(params);
		if (this.css) {
			// добавляем текущую дату
			this.css = this.css.replace(/Date:.*/, 'Date: ' + new Date().toUTCString());
			// увеличиваем версию
			var versionStrA = this.getVersion(params);
			if (versionStrA[2]) {
//			console.log(se);
				var versionA = versionStrA[2].trim().split('.');
				console.log('>>> old version >>> ' + versionA.join('.'));
				switch (params.incrementTpe) {
					case 'major':
					{
						versionA[0]++;
						versionA[1] = 0;
						versionA[2] = 0;
						break;
					}
					case 'minor':
					{
						versionA[1]++;
						versionA[2] = 0;
						break;
					}
					case 'micro':
					{
						if (/a$/.test(versionA[2])) {
							versionA[2] = parseInt(versionA[2]);
						} else {
							versionA[2] = parseInt(versionA[2]) + 1;
						}
						break;
					}
					case 'alpha':
					{
						versionA[2] = parseInt(versionA[2]) + 'a';
						break;
					}
				}
				var versionNew = versionA.join('.');
				console.log('>>> new version >>> ' + versionNew);
				this.css = this.css.replace(versionStrA[0], versionStrA[1] + versionNew);
//				console.log(this.css);
				console.log('');
			}

			// пишем обратно в файл
			fs.writeFileSync(params.pathStyle, this.css);
			setTimeout(function () {
				console.log('ok');
			}, 5000);
		}
	} catch (e) {
		console.error(e);
	}
};
/**
 *
 * @param {Object} params
 * @returns {Array} ['Version: 0.0.0', 'Version: ', '0.0.0']
 */
_plus_version.getVersion = function (params) {
	try {
		this.getCss(params);
		var versionStrA = ['', '', ''];
		if (this.css) {
			versionStrA = this.css.match(/(Version:\s*)(.*)/);
		}
		return versionStrA;
	} catch (e) {
		console.error(e);
	}
};
/**
 *
 * @param {type} params
 * @returns {nm$__plus_version._plus_version.getCss}
 */
_plus_version.getCss = function (params) {
	try {
		if (this.css) {

		} else if (!params.pathStyle || !fs.existsSync(params.pathStyle)) {
			console.error('Неверный путь к файлу.');
		} else if (!params.incrementTpe || !params.incrementTpe.match(/^(major|minor|micro|alpha)$/)) {
			console.error('Неправильный тип инкремента.');
		} else {
			// читаем файл стилей
			this.css = fs.readFileSync(params.pathStyle).toString();
		}
	} catch (e) {
		console.error(e);
	}
};
if (module.parent) {
	module.exports = _plus_version;
}
