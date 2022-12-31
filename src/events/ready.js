const commandHandler = require('../handlers/commandHandler')
const emeraldHandler = require('../handlers/emeraldHandler')

module.exports = {

	name: 'ready',
	once: true,
	execute: async (client) => {

		await emeraldHandler(client)

		commandHandler(client)

		// client.application.commands.set([]);

		const commands = client.commands.map(cmd => {
			return {
				name: cmd.name,
				description: cmd.description ?? 'Sem descrição',
				options: cmd.options,
			}
		})

		client.guilds.cache.forEach(guild => {
			guild.commands.set(commands)
		})

		console.log('\n         Bot started.\n'.green)

		process.on('unhandledRejection', (reason, promise) => {
			console.log('Unhandled Rejection at:', promise, 'reason:', reason)
		})

		process.on('uncaughtException', (err, origin) => {
			console.log('Uncaught Exception at:', origin, 'error:', err)
		})

		process.on('exit', (code) => {
			console.log(`About to exit with code: ${code}`)
		})

	},

}