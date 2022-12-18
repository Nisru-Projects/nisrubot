const BaseCommand = require("../../BaseCommand");
const { ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");

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
	async execute(interaction, characters) {

		const imageUrl = "https://cdn.discordapp.com/attachments/1046167714139475978/1053889265790107719/6HoSErP1Et.png"

		const charactersEmbed = {
			color: 0x36393f,
			title: "Testing",
			timestamp: new Date().toISOString(),
			fields: [
				{
					name: "Character 1",
					value: "Level 1",
					inline: true
				},
				{
					name: "Character 2",
					value: "Level 2",
					inline: true
				},
				{
					name: "Character 3",
					value: "Level 3",
					inline: true
				}
			],
			image: {
				url: imageUrl
			},
		}

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('btn')
					.setLabel('Click me!')
					.setStyle(ButtonStyle.Secondary),
		)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('btn2')
					.setLabel('Click me!')
					.setStyle(ButtonStyle.Success),
		)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('btn3')
					.setLabel('Click me!')
					.setStyle(ButtonStyle.Danger),
		)

		const row2 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('customize')
					.setLabel('Customize')
					.setStyle(ButtonStyle.Primary),
		)

		return interaction.reply({ embeds: [charactersEmbed], components: [row, row2], fetchReply: true })
	}
}