const { Collection } = require('discord.js');
const { readdirSync } = require('fs');
module.exports = (client) => {
    const commandsCollection = new Collection();

    const commands = readdirSync('./src/cmds/');

    commands.forEach(category => {
        const commands = readdirSync(`./src/cmds/${category}`);
        commands.filter(file => !file.includes("!") && file.endsWith(".js")).forEach(file => {

            let Command = require('../cmds/' + category + '/' + file.replace('.js', ''))

            let cmd = new Command(client);

            cmd.category = category
            cmd.fileName = file

            if (!file.includes('!')) commandsCollection.set(cmd.name, cmd)

        })
    })

    client.commands = commandsCollection
    
    console.log(`[COMMANDS] Loaded`.green )
}