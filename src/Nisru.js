const { GatewayIntentBits, Client } = require('discord.js')

const eventsHandler = require('./handlers/eventsHandler')
const DatabaseManager = require('./managers/DatabaseManager')
const CacheManager = require('./managers/CacheManager')
const { createClient } = require('redis')
const redisClient = createClient({ url: `redis://${process.env.REDIS_HOST || 'localhost'}:6379` })
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
		const RedisCache = new CacheManager(redisClient)

		this.dataManager = new DataManager(Database.loadData(this), RedisCache.loadData(this))

		this.verification(options)

	}

	verification(options) {
		if (!options[options.mode].BOT_TOKEN) {
			console.log('[ERRO] Uninformed token'.red)
			return process.exit(1)
		}
		this.token = options[options.mode].BOT_TOKEN
		this.config = options
	}

	async login() {
		await super.login(this.token)
	}

}