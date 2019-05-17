'use strict';
const fs = require('fs');

function handleLogout(req, res) {
	res.writeHead(401, {
		'Content-Type': 'text/html; charset=utf-8'
	});
	res.end('<!DOCTYPE html><html lang="ja"><body>' +
		'<h1>Logout</h1>' +
		'<a href="/posts">Login</a>' +
		'</body></html>'
	);
}

function handleNotFound(req, res){
	res.writeHead(404, {
		'Content-Type': 'text/plain; charset=utf-8'
	});
	res.end('Not Found');
}

function handleBadRequest(req, res){
	res.writeHead(400, {
		'Content-Type': 'text/plain; charset=utf-8'
	});
	res.end('Not supported request');
}

function handleFavicon(req, res){
	res.writeHead(200, {
		'Content-Type': 'image/vnd.microsoft.icon'
	});
	const favicon = fs.readFileSync('./favicon.ico');
	res.end(favicon);
}

module.exports = {
	handleLogout,
	handleNotFound,
	handleBadRequest,
	handleFavicon
};
