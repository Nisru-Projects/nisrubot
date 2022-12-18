const { GatewayIntentBits, Client} = require('discord.js');
const fs = require('fs');

const commandHandler = require('./handlers/commandHandler');
const eventsHandler = require('./handlers/eventsHandler');
const DatabaseController = require('./controllers/DatabaseController');

module.exports = class NisruClient extends Client {

    constructor(options = {}) {

        super({
        
            disableMentions: 'everyone', 
            intents: [GatewayIntentBits.Guilds]
            
        })

        
        console.log(' ');
        this.verification(options)
        commandHandler(this)
        eventsHandler(this)
        const Database = new DatabaseController(options)
        Database.loadData(this)
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