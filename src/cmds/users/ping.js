const BaseCommand = require("../../BaseCommand");

const messages = {
	name: "ping",
	description: "Verifica a latência do bot",
	ping: "Latência atual: {ping}ms"
}

const setStrValues = require("../../utils/setStrValues")

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: messages.name,
			description: messages.description,
			permissions: ['user']
		});
	}
	execute(interaction) {
		const messagesdotping = setStrValues(messages.ping, { ping: this.client.ws.ping })
		return interaction.reply({ content: messagesdotping, ephemeral: true })
	}
}