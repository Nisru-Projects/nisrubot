module.exports = {
	name: 'databaseConnected',
	execute: async (client) => {
		require('../handlers/dbkeysHandler')(client)
	},
}