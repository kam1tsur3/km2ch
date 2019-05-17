'use strict';
const crypto = require('crypto');
const pug = require('pug');
const Cookies = require('cookies');
const util = require('./handler-util');
const Post = require('./post');
const moment = require('moment-timezone');

const trackingIdKey = 'km2ch_id';
function handle(req, res){
	const cookies = new Cookies(req, res);
	const trackingId = addTrackingCookie(cookies, req.user);

	switch (req.method){
		case 'GET':
			res.writeHeader(200, {
				'Context-Type': 'text/html; charset=utf-8'
			});
			Post.findAll({order:[['id', 'DESC']]}).then((posts) => {
				posts.forEach((post) => {
					post.content = post.content.replace(/\+/g, ' ');
					post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD/ HH:mm:ss');
				});
				res.end(pug.renderFile('./views/posts.pug', {
						posts: posts,
						user: req.user
				}));
				console.info(
					`Read by : ${req.user}, ` +
					`trackingId: ${trackingId}, ` +
					`remoteAddress: ${req.connection.remoteAddress}, ` +
					`user-agent: ${req.headers['user-agent']} `
				);
			});
			break;
		case 'POST':
			let body = [];
			req.on('data', (chunk) => {
				body.push(chunk);
			}).on('end', () => {
				body = Buffer.concat(body).toString();
				const decoded = decodeURIComponent(body);
				const content = decoded.split('content=')[1];
				console.info('Posted :' + content);
				Post.create({
					content: content,
					trackingCookie: trackingId,
					postedBy: req.user
				}).then(() => {
					handleRedirectPosts(req, res);
				});
			});
			break;
		default:
			util.handleBadRequest(req, res);	
			break;
	}
}

function handleDelete(req, res){
	switch (req.method){
		case 'POST':
			let body = [];
			req.on('data', (chunk) => {
				body.push(chunk);
			}).on('end', () => {
				body = Buffer.concat(body).toString();
				const decoded = decodeURIComponent(body);
				const id = decoded.split('id=')[1];
				Post.findByPk(id).then((post) => {
					if (req.user === post.postedBy || req.user === 'admin') {
						post.destroy().then(() => {
							console.info(
								`Deleted: user: ${req.user}, ` +
								`remoteAddress: ${req.connection.remoteAddress}, ` +
								`userAgent: ${req.headers['user-agent']} `
							);
							handleRedirectPosts(req, res);
						});
					}
				});
			});
			break;
		default:
			util.handleBadRequest(req, res);
			break;
	}
}
/**
* if trackingId included in cookies is true , return the value
* else create new trackingId and attach to cookie ,and return the value
* @param {Cookies} cookies
* @param {String} userName
* @return {String} trackingId
*/

function addTrackingCookie(cookies, userName){
	const requestedTrackingId = cookies.get(trackingIdKey);
	if (isValidTrackingId(requestedTrackingId, userName)) {
		return requestedTrackingId;
	}
	else {
		const originalId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		const tomorrow = new Date(Date.now() + (1000 * 60 * 60 * 24));
		const trackingId = originalId + '_' + createValidHash(originalId, userName);
		cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
		return trackingId;
	}
}

function isValidTrackingId(trackingId, userName) {
	if(!trackingId) {
		return false;
	}
	const splitted = trackingId.split('_');
	const originalId = splitted[0];
	const requestedHash = splitted[1];
	return createValidHash(originalId, userName) === requestedHash;
}

function createValidHash(originalId, userName) {
	const sha1sum = crypto.createHash('sha1');
	sha1sum.update(originalId + userName);
	return sha1sum.digest('hex');
}

function handleRedirectPosts(req, res) {
	res.writeHead(303, {
		'Location': '/posts'
	});
	res.end();
}

module.exports = {
	handle,
	handleDelete
};
