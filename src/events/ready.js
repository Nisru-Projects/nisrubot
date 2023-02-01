const commandHandler = require('../handlers/commandHandler')
const emeraldHandler = require('../handlers/emeraldHandler')

module.exports = {

	name: 'ready',
	once: true,
	execute: async (client) => {

		await emeraldHandler(client)

		commandHandler(client)

		// client.application.commands.set([]);

		const commands = client.commands.filter((cmd) => cmd.type != 'complementary').map(cmd => {
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
				console.log(`[ERROR] Error while setting commands, verifiy if command key exists in language file\n${error}`.red)
				process.exit(1)
			}
		})

		const time = Math.round(process.uptime())
		console.log(`\n     Bot started in ${time}s\n`.green)

		/* process.on('unhandledRejection', (reason) => {
			const timeError = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
			const receivedFrom = new Error().stack.split('\n')[2].trim()
			console.log(`[ERROR] Unhandled Rejection at: ${timeError}, reason: ${reason}\n${receivedFrom}`.red)
		})

		process.on('uncaughtException', (err) => {
			const timeError = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
			const receivedFrom = new Error()
			console.log(`[ERROR] Uncaught Exception at: ${timeError}, reason: ${err}\n${receivedFrom}`.red)
		})

		process.on('exit', (code) => {
			console.log(`[INFO] Process exited with code: ${code}`.yellow)
		}) */

	},

}