
function run(config) {
//	const fs = require('fs');
	const FTPS = require('ftps');
	const watch = require('watch');
	var isMirror = true;
	config.localDir = config.localDir.replace(/\\/g, '/');
	/**
	 *
	 * @param {string} remotePath
	 * @returns {this}
	 */
	FTPS.prototype.mkdir = function (remotePath) {
		if (remotePath) {
			return this.raw('mkdir ' + this._escapeshell(remotePath));
		}
		return this;
	};
	/**
	 *
	 * @param {string} remotePath
	 * @returns {this}
	 */
//	FTPS.prototype.cls = function (remotePath) {
//		if (remotePath) {
//			return this.raw('cls -d ' + this._escapeshell(remotePath));
//		}
//		return this;
//	};
	/**
	 *
	 * @type FTPS
	 */
	var ftps = new FTPS({
		host: config.host, // required
		username: config.username, // Optional. Use empty username for anonymous access.
		password: config.password, // Required if username is not empty, except when requiresPassword: false
		protocol: 'ftp', // Optional, values : 'ftp', 'sftp', 'ftps', ... default: 'ftp'
		// protocol is added on beginning of host, ex : sftp://domain.com in this case
		port: 21, // Optional
		// port is added to the end of the host, ex: sftp://domain.com:22 in this case
		escape: true, // optional, used for escaping shell characters (space, $, etc.), default: true
		retries: 2, // Optional, defaults to 1 (1 = no retries, 0 = unlimited retries)
		timeout: 10, // Optional, Time before failing a connection attempt. Defaults to 10
		retryInterval: 5, // Optional, Time in seconds between attempts. Defaults to 5
		retryMultiplier: 1, // Optional, Multiplier by which retryInterval is multiplied each time new attempt fails. Defaults to 1
		requiresPassword: true, // Optional, defaults to true
		// autoConfirm: true, // Optional, is used to auto confirm ssl questions on sftp or fish protocols, defaults to false
		// cwd: '', // Optional, defaults to the directory from where the script is executed
		additionalLftpCommands: 'set ftp:ssl-allow no', // Additional commands to pass to lftp, splitted by ';'
		// requireSSHKey:  true, //  Optional, defaults to false, This option for SFTP Protocol with ssh key authentication
		// sshKeyPath: '/home1/phrasee/id_dsa' // Required if requireSSHKey: true , defaults to empty string, This option for SFTP Protocol with ssh key authentication
		e: ''
	});
	/**
	 * Дополнительные опции для скрипта синхронизации по FTP.
	 *
	 * @type Array
	 */
	var options = [
		'-p'
	];
	config.delete && options.push('--delete');
	config.include && options.push('--include="' + config.include + '"');
	config.exclude && options.push('--exclude="' + config.exclude + '"');
	/**
	 *
	 */
	_mirror();
	/**
	 *
	 */
	function _mirror() {
		ftps
				.mirror({
					remoteDir: config.remoteDir,
					localDir: _path_local(config.localDir),
					// filter: /(^|.*\/)t|^v/, // optional, filter the files synchronized
					parallel: config.parallel, // optional, default: false
					upload: true, // optional, default: false, to upload the files from the locaDir to the remoteDir
					// options: '--delete --exclude="\.tgrwb*|\.realsync"'
					options: options.join(' ')
				})
				.exec((err, res) => {
					if (err) {
						console.log(res);
					} else {
						console.log(config.remoteDir);
						isMirror = false;
						_watch();
					}
				});
	}
	function _mirror_refresh(monitor) {
		isMirror = true;
		monitor.stop(); // Stop watching
		_mirror();
	}
	function _watch() {
		watch.createMonitor(config.localDir, function (monitor) {
			// monitor.files['./test/.zshrc'] // Stat object for my zshrc.
			// Handle new files
			monitor.on("created", function (f, stat) {
				if (isMirror) {
					return;
				}
				if (!_is_exclude(f)) {
					if (stat.isFile()) {
						console.log('Handle new files => ' + _path_local(f) + "\n-> " + _path_server(f));
						ftps.put(_path_local(f), _path_server(f)).exec((err, res) => {
							if (err) {
								console.log(res);
							}
						});
					} else if (stat.isDirectory()) {
						console.log('Handle new dir => ' + _path_server(f));
						ftps.mkdir(_path_server(f)).exec((err, res) => {
							if (err) {
								console.log(res);
							}
						});
//						_mirror_refresh(monitor);
					}
				} else {
					console.log('Exclude new file => ' + _path_local(f) + "\n-> " + _path_server(f));
				}
			});
			// Handle file changes
			monitor.on("changed", function (f, curr, prev) {
				if (isMirror) {
					return;
				}
				if (!_is_exclude(f)) {
					console.log('Handle file changes => ' + _path_local(f) + "\n-> " + _path_server(f));
					setTimeout(function () {
						ftps.put(_path_local(f), _path_server(f)).exec((err, res) => {
							if (err) {
								console.log(res);
							}
						});
					}, Math.random() * 1000);
				} else {
					console.log('Exclude file changes => ' + _path_local(f) + "\n-> " + _path_server(f));
				}
			});
			// Handle removed files
			monitor.on("removed", function (f, stat) {
				console.log('--------------' + f);
//				console.log('Handle removed files');
//				console.log(ftps.cls(_path_local(f)).exec((err, res) => {
//				}));
				if (!_is_exclude(f)) {
					_mirror_refresh(monitor);
//					if (stat.isFile()) {
//					console.log(ftps.cls(_path_server(f)).exec((err, res) => {
//						console.log('Handle removed files => ' + _path_local(f) + "\n-> " + _path_server(f));
//						console.log(err);
//						console.log(res);
//					}));
//					ftps.rm(_path_server(f)).exec((err, res) => {
//						if (/550 File not found/.test(res.error)) {
//							ftps.rmdir(_path_server(f)).exec((err, res) => {
//								console.log('Handle removed dir => ' + _path_server(f));
//								console.log(err);
//								console.log(res);
//							});
//						} else {
//							console.log('Handle removed files => ' + _path_local(f) + "\n-> " + _path_server(f));
//							console.log(err);
//							console.log(res);
//						}
//					});
////					} else if (stat.isDirectory()) {
//					ftps.rmdir(_path_server(f)).exec((err, res) => {
//						console.log('Handle removed dir => ' + _path_server(f));
//						console.log(err);
//						console.log(res);
//					});
////						_mirror_refresh(monitor);
//					}
				} else {
					console.log('Exclude removed files => ' + _path_local(f) + "\n-> " + _path_server(f));
				}
			});
			// monitor.stop(); // Stop watching
		});
	}
	function _path_local(f) {
		return f.replace(/\\/g, '/').replace(/^(\D)\:/, "/cygdrive/$1");
	}
	function _path_server(f) {
		return f.replace(/\\/g, '/').replace(new RegExp('^' + config.localDir), config.remoteDir);
	}
	function _is_exclude(f) {
		return !!config.exclude ? new RegExp(config.exclude).test(f) : false;
	}
}
if (module.parent) {
	module.exports.run = run;
}
