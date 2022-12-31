const BaseCommand = require('../../BaseCommand')

const DataManager = require('../../managers/DataManager')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.test.name'),
			description: client.languages.content('commands.test.name'),
			permissions: ['admin.tools.test'],
		})
	}
	// eslint-disable-next-line no-unused-vars
	async execute(interaction) {

		console.time('test')

		const dataManager = new DataManager(this.client.knexDatabase, this.client.redisCache)

		await dataManager.benchmark(interaction.user.id)

		console.timeEnd('test')

		return interaction.reply({ content: 'Teste concluído', ephemeral: true })

	}
}