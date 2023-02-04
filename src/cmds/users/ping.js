const BaseCommand = require('../../utils/BaseCommand')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'ping',
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