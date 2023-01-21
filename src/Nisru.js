const { GatewayIntentBits, Client } = require('discord.js')
process.removeAllListeners('warning')
const eventsHandler = require('./handlers/eventsHandler')
const DbManager = require('./managers/DbManager')
const RedisManager = require('./managers/RedisManager')
const DataManager = require('./managers/DataManager')

module.exports = class NisruClient extends Client {

	constructor(options = {}) {

		super({
			allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
			intents: [GatewayIntentBits.Guilds],
		})

		console.log(' ')
		eventsHandler(this)

		const Database = new DbManager(options)
		const RedisCache = new RedisManager(this)

		this.dataManager = new DataManager(Database.loadData(this), RedisCache.loadData(this))

		this.dataManager.createBackup()
		this.dataManager.deleteOldBackups()

		this.verification(options)

	}

	verification(options) {
		if (!options[options.mode].BOT_TOKEN) {
			console.log('[ERROR] Token not found'.red)
			return process.exit(1)
		}
		this.token = options[options.mode].BOT_TOKEN
		this.config = options
	}

	async login() {
		await super.login(this.token)
	}

}