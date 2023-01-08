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

		client.guilds.cache.forEach(async guild => {
			try {
				await guild.commands.set(commands)
			}
			catch (error) {
				/* empty */
				console.log(`[ERROR] ${error.message}`.red)
			}
		})

		const time = Math.round(process.uptime())
		console.log(`\n     Bot started in ${time}s\n`.green)

		process.on('unhandledRejection', (reason, promise) => {
			console.log(`[ERROR] Unhandled Rejection at: ${promise}, reason: ${reason}`.red)
		})

		process.on('uncaughtException', (err, origin) => {
			console.log(`[ERROR] Uncaught Exception at: ${origin}, reason: ${err}`.red)
		})

		process.on('exit', (code) => {
			console.log(`[INFO] Process exited with code: ${code}`.yellow)
		})

	},

}