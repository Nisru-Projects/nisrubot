const BaseCommand = require('../../BaseCommand')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.benchmark.name'),
			description: client.languages.content('commands.benchmark.name'),
			permissions: ['admin.benchmark'],
		})
	}
	// eslint-disable-next-line no-unused-vars
	async execute(interaction) {

		console.time('test')

		await this.client.dataManager.benchmark(interaction.user.id)

		console.timeEnd('test')

		return interaction.reply({ content: 'Teste concluído', ephemeral: true })

	}
}