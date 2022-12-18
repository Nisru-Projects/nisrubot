const BaseCommand = require("../../BaseCommand");
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, ComponentType } = require("discord.js");
const disableAllButtons = require("../../utils/disableAllButtons");

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
					value: "Level 1\nMore infos",
					inline: true
				},
				{
					name: "Character 2",
					value: "Level 2\nMore infos",
					inline: true
				},
				{
					name: "Character 3",
					value: "Level 3\nMore infos",
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
					.setLabel('Select 1')
					.setEmoji('👤')
					.setStyle(ButtonStyle.Secondary),
		)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('btn2')
					.setLabel('Select 2')
					.setEmoji('👤')
					.setStyle(ButtonStyle.Secondary),
		)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('create')
					.setLabel('Create')
					.setEmoji('➕')
					.setStyle(ButtonStyle.Success),
		)

		const row2 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('customize')
					.setLabel('Customize Selected')
					.setEmoji('1054051525204385882')
					.setStyle(ButtonStyle.Primary),
		)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel('Delete')
					.setStyle(ButtonStyle.Danger),
		)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('sell')
					.setLabel('Sell')
					.setStyle(ButtonStyle.Success),
		)

		const charactersMsg = await interaction.reply({ embeds: [charactersEmbed], components: [row, row2], fetchReply: true })

		const filter = (interaction) => interaction.user.id === interaction.user.id

		const collector = charactersMsg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 10000 })

		collector.on('collect', async (interaction) => {
			interaction.deferUpdate().then(() => {
				collector.resetTimer()
			})
		})

		collector.on('end', async (collected) => {
			disableAllButtons(charactersMsg)
		})

	}
}