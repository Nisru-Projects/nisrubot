const BaseCommand = require("../../BaseCommand");
const LanguagesController = require("../../controllers/LanguagesController");

const messages = {
	name: "ping",
	description: "Verifica a latência do bot",
	calculating: "**Calculando...**",
	ping: "🏓 Latência atual: {ping}ms\n🤖 Latência da API: {api}ms"
}

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: messages.name,
			description: messages.description,
			permissions: ['user']
		});
	}
	execute(interaction) {

		const Languages = new LanguagesController(interaction.user.language)

		const { setStrValues } = Languages

		return interaction.reply({ fetchReply: true, content: setStrValues(messages.ping, { ping: messages.calculating, api: this.client.ws.ping }) }).then(msg => {
			msg.edit({ content: setStrValues(messages.ping, { ping: msg.createdTimestamp - interaction.createdTimestamp, api: this.client.ws.ping }) })
		})
	}
}