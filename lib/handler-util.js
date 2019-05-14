'use strict';

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
	res.end('Not supported');
}

module.exports = {
	handleLogout,
	handleNotFound,
	handleBadRequest
};
