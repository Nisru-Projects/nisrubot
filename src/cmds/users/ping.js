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
		return interaction.reply({ fetchReply: true, content: this.client.languages.content('messages.ping.ping', { ping: '{%messages.ping.calculating}', api: this.client.ws.ping }) }).then(msg => {
			msg.edit({ content: this.client.languages.content('messages.ping.ping', { ping: msg.createdTimestamp - interaction.createdTimestamp, api: this.client.ws.ping }) })
		})
	}
}