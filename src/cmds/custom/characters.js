const BaseCommand = require("../../BaseCommand");
const { EmbedBuilder } = require("discord.js");

const messages = {
	name: "characters",
	description: "Visualize e gerencie seus personagens"
}

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: messages.name,
			description: messages.description,
			permissions: ['user'],
		});
	}
	async execute(interaction) {

		const charactersEmbed = {
			color: 0x36393f,
			title: "Testing",
			timestamp: new Date().toISOString(),
		}

		const charactersMessage = await interaction.reply({ embeds: [charactersEmbed], fetchReply: true })

		setTimeout(() => {
			charactersEmbed.description = "Você não possui nenhum personagem."
			charactersMessage.edit({ embeds: [charactersEmbed] })
		}, 5000)
	}
}