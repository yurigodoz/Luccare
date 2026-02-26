let io;

module.exports = {
	setIo: (instance) => { io = instance; },
	getIo: () => io,
};
