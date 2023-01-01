const { GatewayIntentBits, Client } = require('discord.js')

const eventsHandler = require('./handlers/eventsHandler')
const DatabaseManager = require('./managers/DatabaseManager')
const CacheManager = require('./managers/CacheManager')
const DataManager = require('./managers/DataManager')

module.exports = class NisruClient extends Client {

	constructor(options = {}) {

		super({
			allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
			intents: [GatewayIntentBits.Guilds],
		})

		console.log(' ')
		eventsHandler(this)

		const Database = new DatabaseManager(options)
		const RedisCache = new CacheManager(this)

		this.dataManager = new DataManager(Database.loadData(this), RedisCache.loadData(this))

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