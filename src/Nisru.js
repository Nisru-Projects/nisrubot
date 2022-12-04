const { GatewayIntentBits, Collection, Client} = require('discord.js');
const fs = require('fs');
const { readdirSync } = require('fs');

module.exports = class NisruClient extends Client {

    constructor(options = {}) {

        super({
        
            disableMentions: 'everyone', 
            intents: [GatewayIntentBits.Guilds]
            
        })

        console.log(' ');
        this.verification(options)
        this.loadCommands()
        this.loadEvents()
        this.loadData(options)
    }

    verification(options) {
        if (!options.BOT_TOKEN) {
            console.log(`[ERRO] Token não informado`.red)
            return
        }
        this.token = options.BOT_TOKEN
        this.config = options
    }

    loadCommands() {
        
        const x = new Collection();

        const commands = readdirSync('./src/cmds/');

        commands.forEach(category => {
            const commands = readdirSync(`./src/cmds/${category}`);
            commands.forEach(file => {

                let Command = require('./cmds/' + category + '/' + file.replace('.js', ''))

                let cmd = new Command(this);

                if (!file.includes('!')) x.set(cmd.name, cmd)

            })
        })

        this.commands = x
        
        console.log(`[COMANDOS] Carregados`.green )
    }

    loadEvents() {
        fs.readdir("./src/events/", (err, files) => {
            if (err) return console.error(err);
            files.forEach(file => {
                let eventFunction = require(`./events/${file}`);
                this.on(eventFunction.name, (...args) => eventFunction.execute(this, ...args));
            });
        });
        console.log(`[EVENTOS] Carregados`.green )
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
            console.log(`[DATABASE] Não conectado`.red )
            process.exit(1);
        });
    
    }

    async login() {
        await super.login(this.token);
    }

}