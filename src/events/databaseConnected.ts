import type { NisruClient } from '../Nisru'

import dbkeysHandler from '../handlers/dbkeysHandler'
export default {
	name: 'databaseConnected',
	execute: async (client: NisruClient, time: number) => {
		dbkeysHandler(client, time)
	},
}