module.exports = {
	name: 'redisConnected',
	execute: async (client) => {
		console.log('[REDIS] Connected'.green)
		require('../handlers/imageHandler')(client)
	},
}