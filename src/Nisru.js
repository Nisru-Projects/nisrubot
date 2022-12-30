const { GatewayIntentBits, Client } = require('discord.js')

const commandHandler = require('./handlers/commandHandler')
const eventsHandler = require('./handlers/eventsHandler')
const DatabaseManager = require('./managers/DatabaseManager')
const LanguagesController = require('./controllers/LanguagesController')
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
		this.languages = new LanguagesController('pt-BR')
		this.languages.load()
		this.verification(options)
		commandHandler(this)
		eventsHandler(this)
		const Database = new DatabaseManager(options)
		Database.loadData(this)
		this.redisCache = new CacheManager(redisClient)
		this.redisCache.connect().then (() => {
			this.emit('redisConnected', this)
		}).catch(err => {
			console.log(`[REDIS] Not connected: ${err.message}`.red)
			this.redisCache = null
		})

	}

	verification(options) {
		if (!options.BOT_TOKEN) {
			console.log('[ERRO] Uninformed token'.red)
			return process.exit(1)
		}
		this.token = options.BOT_TOKEN
		this.config = options
	}

	async login() {
		await super.login(this.token)
	}

}