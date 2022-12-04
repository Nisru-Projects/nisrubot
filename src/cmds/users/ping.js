const BaseCommand = require("../../BaseCommand");

class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'ping',
			description: 'Verifica a latência do bot',
			permissions: ['user'],
		});
	}

	execute(interaction) {
		return interaction.reply({ content: `Latência atual: ${this.client.ws.ping}ms` });
	}
}

module.exports = Command