module.exports = class PgBaseManager {
	constructor(options) {
		this.options = options[options.mode]
	}

	loadData(client, options = this.options) {

		const knex = require('knex')({
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
		})

		knex.raw('select 1+1 as result').then(() => {
			client.emit('databaseConnected', client)
		}).catch(err => {
			console.log(`[DATABASE] Not connected: ${err.message}`.red)
			process.exit(1)
		})

		client.knexDatabase = knex

		return knex

	}

}