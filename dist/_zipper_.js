
function run(config) {

	const path = require('path');
	const fs = require('fs');
	const zipFolder = require('zip-folder');
	const archiver = require('archiver');

	var dirPath = config.dirPath.trim() ? path.resolve(config.dirPath.trim()) : '';
	var cssPath = config.stylePath || path.resolve(dirPath, 'style.css');
	var dirName = config.dirName || dirPath.replace(/^.*?([a-z0-9_\.-]+)$/, "$1");
	var zipName = config.zipName || dirName;

	console.log(dirPath);
	console.log(dirName);
	console.log(zipName);

	if (fs.existsSync(dirPath) && zipName) {
		var outDirPath = config.outDirPath || config.zipPath || path.resolve(dirPath, '..');
		try {
			fs.accessSync(outDirPath, fs.constants.R_OK | fs.constants.W_OK);
		} catch (err) {
			fs.mkdirSync(outDirPath, {recursive: true});
		}
		if (fs.existsSync(cssPath)) {
			// читаем файл стилей
			var css = fs.readFileSync(cssPath).toString();
			// находим версию
			var se = css.match(/(Version:\s*)(.*)/);
			if (se && se[2]) {
				var version = se[2].trim().replace(/^.*?(\d+\.\d+\.\d+\w?).*$/g, "$1");
				zipName += '.' + version;
			}
		}
		// текущая дата
		var time = new Date().toISOString().replace(/\..+$/g, '').replace(/\D/g, '');
		zipName += '.' + time + '.zip';
		//
		var zipPath = path.resolve(outDirPath, zipName);
		console.log(zipPath);
	}
	if (zipPath) {
		// create a file to stream archive data to.
		var output = fs.createWriteStream(zipPath);
		var archive = archiver('zip', {
			zlib: {level: 9} // Sets the compression level.
		});

		// listen for all archive data to be written
		// 'close' event is fired only when a file descriptor is involved
		output.on('close', function () {
			console.log(archive.pointer() + ' total bytes');
			console.log('archiver has been finalized and the output file descriptor has closed.');
			stop();
		});

		// This event is fired when the data source is drained no matter what was the data source.
		// It is not part of this library but rather from the NodeJS Stream API.
		// @see: https://nodejs.org/api/stream.html#stream_event_end
		output.on('end', function () {
			console.log('Data has been drained');
			stop();
		});

		// good practice to catch warnings (ie stat failures and other non-blocking errors)
		archive.on('warning', function (err) {
			if (err.code === 'ENOENT') {
				// log warning
			} else {
				// throw error
				throw err;
			}
			stop();
		});

		// good practice to catch this error explicitly
		archive.on('error', function (err) {
			throw err;
			stop();
		});

		// pipe archive data to the file
		archive.pipe(output);

		// append files from a sub-directory and naming it `new-subdir` within the archive
		archive.directory(dirPath, dirName);

		// finalize the archive (ie we are done appending files but streams have to finish yet)
		// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
		archive.finalize();
	}
	function stop() {
		setTimeout(function () {}, 5000);
	}
}

if (module.parent) {
	module.exports.run = run;
}
