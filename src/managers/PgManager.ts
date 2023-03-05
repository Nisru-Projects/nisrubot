import { Knex, knex } from 'knex'
import NisruClient from '../Nisru'
import { ConfigOptions } from '../types/config'

export default class PgManager {

	options: ConfigOptions['development' | 'production']

	constructor(options: ConfigOptions) {
		this.options = options[options.mode]
	}

	loadData(client: NisruClient, options = this.options) {

		const time = Date.now()

		const config: Knex.Config = {
			client: 'pg',
			connection: {
				host : options.DB_HOST,
				port : options.DB_PORT,
				user : options.DB_USER,
				password : options.DB_PASSWORD,
				database : options.DB_DATABASE,
				supportBigNumbers: true,
				bigNumberStrings: true,
			},
		}

		const knexInstance = knex(config);

		knexInstance.raw('select 1+1 as result').then(() => {
			client.emit('databaseConnected', time)
		}).catch(err => {
			console.log(`[DATABASE] Not connected: ${err.message}`.red)
			process.exit(1)
		})

		client.knexInstance = knex

		return knex

	}

}