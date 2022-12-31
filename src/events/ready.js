const commandHandler = require('../handlers/commandHandler')

module.exports = {

	name: 'ready',
	once: true,
	execute: async (client) => {

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
			// checar se já tem os comandos
			guild.commands.set(commands)
		})

		console.log('\n         Bot started.\n'.green)

		process.on('unhandledRejection', (reason, promise) => {
			console.log('Unhandled Rejection at:', promise, 'reason:', reason)
		},
		)

		process.on('uncaughtException', (err, origin) => {
			console.log('Uncaught Exception at:', origin, 'error:', err)
		},
		)

		process.on('warning', (warning) => {
			console.log(warning.name)
			console.log(warning.message)
			console.log(warning.stack)
		},
		)

		process.on('exit', (code) => {
			console.log(`About to exit with code: ${code}`)
		},
		)

	},

}