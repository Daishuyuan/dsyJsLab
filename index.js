// build up application
(function () {
	const express = require('express');
	const app = express();
	const path = require('path');
	const log4js = require('log4js');
	const compress = require('compression');

	initLog(log4js);
	initWeb(compress, express, app, log4js, 3000);
})();

function initLog(log4js) {
	log4js.configure({
		appenders: {
			file: {
				type: 'file',
				filename: __dirname + '/logs/dsyJsLab.log', 
				maxLogSize: 10, 
				backups: 3, 
				compress : true,
				encoding: 'utf-8', 
				category: 'log_file',
				numBackups: 5, 
				compress: true, 
				encoding: 'utf-8',
			},
			dateFile: {
				type: 'dateFile',
				filename: '/logs/more-important-things.log',
				pattern: 'yyyy-MM-dd-hh',
				compress: true
			},
			out: {
				type: 'stdout'
			}
		},
		categories: {
			default: {
				appenders: ['file', 'dateFile', 'out'],
				level: 'trace'
			}
		}
	});
}

function initWeb(compress, express, app, log4js, port) {
	var logger = log4js.getLogger(), 
		options = {
		root: __dirname + '/resource/',
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};

	app.use(express.static('public'));
	app.use(compress());

	app.get('/csv/:name', function (req, res) {
		var fileName = req.params.name;
		res.sendFile(fileName + ".csv", options, function (err) {
			if (err) {
				logger.error(err);
			}
		});
	});

	app.listen(port, function () {
		console.log('app listen address:http://localhost:' + port);
	});
}