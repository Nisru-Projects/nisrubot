const BaseCommand = require('../../BaseCommand')

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

		const EmeraldManager = require('../../managers/EmeraldManager')
		const emeraldManager = new EmeraldManager(this.client.config.emeraldtoken)
		emeraldManager.getContent('nisruemerald', 'resources').then(res => {
			console.log(res.data)
		}).catch(err => {
			console.log(err)
		})

	}
}