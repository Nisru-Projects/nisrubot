const { GatewayIntentBits, Client} = require('discord.js');
const fs = require('fs');

const commandHandler = require('./handlers/commandHandler');
const eventsHandler = require('./handlers/eventsHandler');
const DatabaseManager = require('./managers/DatabaseManager');
const LanguagesController = require('./controllers/LanguagesController');
const CacheManager = require('./managers/CacheManager');
const { createClient } = require('redis');
const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

module.exports = class NisruClient extends Client {

    constructor(options = {}) {

        super({
            allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
            intents: [GatewayIntentBits.Guilds]
        })

        console.log(' ');
        this.languages = new LanguagesController("pt-BR")
        this.languages.load()
        this.verification(options)
        commandHandler(this)
        eventsHandler(this)
        const Database = new DatabaseManager(options)
        Database.loadData(this)
        this.redisCache = new CacheManager(redisClient)
    }

    verification(options) {
        if (!options.BOT_TOKEN) {
            console.log(`[ERRO] Uninformed token`.red)
            return
        }
        this.token = options.BOT_TOKEN
        this.config = options
    }

    async login() {
        await super.login(this.token);
    }

}