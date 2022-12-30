const { Collection } = require('discord.js')
const { readdirSync } = require('fs')
module.exports = (client) => {
	const commandsCollection = new Collection()

	const categories = readdirSync('./src/cmds/')

	categories.forEach(category => {
		const commands = readdirSync(`./src/cmds/${category}`)
		commands.filter(file => !file.includes('!') && file.endsWith('.js')).forEach(file => {

			const Command = require(`../cmds/${category}/${file.replace('.js', '')}`)

			const cmd = new Command(client)

			cmd.category = category
			cmd.fileName = file

			if (!file.includes('!')) commandsCollection.set(cmd.name, cmd)

		})
	})

	client.commands = commandsCollection
	console.log(`[COMMANDS] Loaded ${client.commands.size} commands`.green)

}