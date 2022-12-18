const { GatewayIntentBits, Client} = require('discord.js');
const fs = require('fs');

const commandHandler = require('./handlers/commandHandler');
const eventsHandler = require('./handlers/eventsHandler');

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
        this.loadData(options)
    }

    verification(options) {
        if (!options.BOT_TOKEN) {
            console.log(`[ERRO] Uninformed token`.red)
            return
        }
        this.token = options.BOT_TOKEN
        this.config = options
    }

    loadData(options) {

        const db = require('knex')({
            client: 'pg',
            connection: {
              host : options.DB_HOST,
              port : options.DB_PORT,
              user : options.DB_USER,
              password : options.DB_PASSWORD,
              database : options.DB_DATABASE,
              supportBigNumbers: true,
              bigNumberStrings: true,
            }
        });

        this.db = db;

        db.raw('select 1+1 as result').then(() => {
            this.emit('databaseConnected', this)
        }).catch(err => {
            console.log(`[DATABASE] Not connected`.red )
            process.exit(1);
        });
    
    }

    async login() {
        await super.login(this.token);
    }

}