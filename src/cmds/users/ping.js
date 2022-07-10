const BaseCommand = require("../../BaseCommand");

class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'ping',
			description: 'Verifica a latência do bot'
		});
	}

	execute(client, interaction) {
		return interaction.reply({ content: `Latência atual: ${client.ws.ping}ms` });
	}
}

module.exports = Command