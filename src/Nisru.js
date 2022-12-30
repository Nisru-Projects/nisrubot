const { GatewayIntentBits, Client } = require('discord.js')

const commandHandler = require('./handlers/commandHandler')
const eventsHandler = require('./handlers/eventsHandler')
const emeraldHandler = require('./handlers/emeraldHandler')
const DatabaseManager = require('./managers/DatabaseManager')
const CacheManager = require('./managers/CacheManager')
const { createClient } = require('redis')
const redisClient = createClient({ url: `redis://${process.env.REDIS_HOST || 'localhost'}:6379` })

module.exports = class NisruClient extends Client {

	constructor(options = {}) {

		super({
			allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
			intents: [GatewayIntentBits.Guilds],
		})

		console.log(' ')
		eventsHandler(this)
		const Database = new DatabaseManager(options)
		Database.loadData(this)
		this.redisCache = new CacheManager(redisClient)
		this.redisCache.connect().then(() => {
			this.emit('redisConnected', this)
		}).catch(err => {
			console.log(`[REDIS] Not connected: ${err.message}`.red)
			this.redisCache = null
		})
		this.verification(options)
		emeraldHandler(this).then(() => {
			commandHandler(this)
		})

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