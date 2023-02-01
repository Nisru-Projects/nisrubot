const dbkeysHandler = require('../handlers/dbkeysHandler')
module.exports = {
	name: 'databaseConnected',
	execute: async (client, time) => {
		dbkeysHandler(client, time)
	},
}