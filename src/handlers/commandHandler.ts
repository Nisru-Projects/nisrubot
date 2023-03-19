import { Collection } from 'discord.js'
import { readdirSync } from 'fs'
import type { NisruClient } from '../Nisru'
import { NisruCommand } from '../types/commands'
module.exports = (client: NisruClient) => {
	const commandsCollection = new Collection<string, NisruCommand>()

	const categories = readdirSync('./src/cmds/')

	const time = Date.now()

	categories.forEach(category => {
		const commands = readdirSync(`./src/cmds/${category}`)
		commands.filter(file => !file.includes('!') && file.endsWith('.js')).forEach(file => {

			const Command = require(`../cmds/${category}/${file.replace('.js', '')}`)

			const cmd = new Command(client)

			cmd.category = category
			cmd.fileName = file

			commandsCollection.set(cmd.name, cmd)

		})
	})

	client.commands = commandsCollection
	console.log(`[COMMANDS] Loaded ${client.commands.filter(cmd => cmd.type != 'complementary').size} commands (${client.commands.filter(cmd => cmd.type == 'complementary').size} complementary commands) in ${(Date.now() - time) / 1000}s`.green)

}