const BaseCommand = require('../../BaseCommand')

const DataController = require('../../controllers/DataController')

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

		const dataController = new DataController(this.client.knexDatabase, this.client.redisCache)

		await dataController.benchmark(interaction.user.id)

		console.timeEnd('test')

		return interaction.reply({ content: 'Teste concluído', ephemeral: true })

	}
}