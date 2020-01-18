'use strict';

/* global __dirname */

const _auto_require_files = require('./_require_files.js');
const pluginName = 'TgrwbRequireFilesWebpackPlugin';

class TgrwbAutoRequireFilesWebpackPlugin {
	constructor(config) {
		this.config = config;
	}
	auto_require() {
		_auto_require_files.run(this.config);
	}
	apply(compiler) {
		var _this = this;
		if (compiler === undefined) {
			return _this.auto_require();
		} else {
			// To check which version of webpack is used
			var hooks = compiler.hooks;
			if (_this.config.watch) {
				var compile = function (params) {
					_this.auto_require();
				};
				if (hooks) {
					hooks.compile.tap(pluginName, compile);
				} else {
					compiler.plugin("compile", compile);
				}
			} else if (_this.config.beforeEmit && !_this.config.watch) {
				var emit = function (compilation, callback) {
					_this.auto_require();
					callback();
				};
				if (hooks) {
					hooks.emit.tapAsync(pluginName, emit);
				} else {
					compiler.plugin("emit", emit);
				}
			} else {
				return _this.auto_require();
			}
		}
	}
}

module.exports = TgrwbAutoRequireFilesWebpackPlugin;
