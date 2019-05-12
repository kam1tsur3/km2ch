'use strict';
const http = require('http');
const auth = require('http-auth');
const router = require('./lib/router');

const basic = auth.basic({
	realm: 'enter username and password.',
	file: './users.htpasswd'
});

const server = http.createServer(basic, (req, res) => {
	router.route(req,res);
}).on('error', (e) => {
	console.error('Server error', + e);
}).on('clientError', (e) => {
	console.error('Client error', + e);
});

const port = 8000;
server.listen(port, () => {
	console.info('Listening on ' + port);
});
