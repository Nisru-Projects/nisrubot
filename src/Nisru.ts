import { ConfigOptions } from "./types/config"

import { GatewayIntentBits, Client } from 'discord.js'
process.removeAllListeners('warning')
import eventsHandler from './handlers/eventsHandler'
import PgManager from './managers/PgManager'
import RedisManager from './managers/RedisManager'
import DataManager from './managers/DataManager'
import { NisruCommand } from "./types/commandOptions"

class NisruClient extends Client {
	dataManager: any
	config!: ConfigOptions
	token!: string
	knexInstance!: any
	commands: NisruCommand[] = []
	languages: NisruLanguage 

	constructor(options: ConfigOptions) {

		super({
			allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
			intents: [GatewayIntentBits.Guilds],
		})

		console.log(' ')
		eventsHandler(this)

		const Database = new PgManager(options)
		const RedisCache = new RedisManager(this)

		this.dataManager = new DataManager(Database.loadData(this), RedisCache.loadData(this))

		this.dataManager.createBackup()
		this.dataManager.deleteOldBackups()
		this.dataManager.clientId = options[options.mode].BOT_ID

		this.verification(options)

	}

	verification(options: ConfigOptions) : void {
		if (!options[options.mode].BOT_TOKEN) {
			console.log('[ERROR] Token not found'.red)
			return process.exit(1)
		}
		this.token = options[options.mode].BOT_TOKEN
		this.config = options
	}

	async login(): Promise<string> {
		return super.login(this.token)
	}

}

export default NisruClient