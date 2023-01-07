const BaseCommand = require('../../BaseCommand')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.ping.name'),
			description: client.languages.content('commands.ping.name'),
			permissions: ['user'],
		})
	}
	execute(interaction) {
		const client = this.client
		function ping(letping) {
			return client.languages.content('messages.ping.ping', { ping: letping, api: client.ws.ping })
		}
		return interaction.reply({ fetchReply: true, content: ping('{%messages.ping.calculating') }).then(msg => {
			msg.edit({ content: ping(msg.createdTimestamp - interaction.createdTimestamp) })
		})
	}
}