require('dotenv').config();
const jwt = require('jsonwebtoken');
const { findLink } = require('./repositories/dependentUserRepository');

let io;

async function verifyToken(token) {
	const mode = process.env.AUTH_MODE || 'LOCAL';

	if (mode === 'LOCAL') {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (decoded.app !== process.env.AUTH_API_APP_SLUG) {
			throw new Error('App inválido');
		}
		return decoded.userId;
	}

	if (mode === 'REMOTE') {
		const response = await fetch(`${process.env.AUTH_API_URL}/auth/validate-token`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'appSlug': process.env.AUTH_API_APP_SLUG
			}
		});

		if (!response.ok) throw new Error('Token inválido');

		const data = await response.json();
		if (data.app !== process.env.AUTH_API_APP_SLUG) throw new Error('App inválido');
		return data.userId;
	}

	throw new Error('AUTH_MODE inválido');
}

function setupSocket(instance) {
	io = instance;

	io.use(async (socket, next) => {
		const raw = socket.handshake.auth?.token;
		if (!raw) return next(new Error('Token ausente'));

		const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

		try {
			socket.userId = await verifyToken(token);
			next();
		} catch (err) {
			next(new Error('Token inválido'));
		}
	});

	io.on('connection', (socket) => {
		socket.on('join-dependent', async (dependentId) => {
			try {
				const link = await findLink(Number(dependentId), socket.userId);
				if (!link) {
					socket.emit('error', { message: 'Acesso negado' });
					return;
				}
				socket.join(`dep-${dependentId}`);
			} catch (err) {
				socket.emit('error', { message: 'Erro ao verificar acesso' });
			}
		});
	});
}

module.exports = {
	setIo: (instance) => { io = instance; },
	getIo: () => io,
	setupSocket,
};
