const BaseCommand = require('../../utils/BaseCommand')
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js')
const disableAllComponents = require('../../utils/disableAllComponents')
const CharacterController = require('../../controllers/CharacterController')
const ActionsController = require('../../controllers/ActionsController')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.mycharacter.name'),
			description: client.languages.content('commands.mycharacter.description'),
			permissions: ['user'],
		})
	}
	async execute(interaction, characters) {

		const ActionController = new ActionsController(this.client.redisCache)

		if (await ActionController.inAction(interaction.user.id, 'mycharacter_command')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.mycharacter_command_already'), ephemeral: true })
		}

		await ActionController.addAction(interaction.user.id, { id: 'mycharacter_command', duration: 60 * 12 })

		const LanguagesController = this.client.languages

		const Character = new CharacterController(this.client, interaction.user)

		const action = {
			reset: () => {
				action.active = false
				action.step = 0
				action.stepMax = 2
				action.user_id = interaction.user.id
			},
		}

		action.reset()

		async function getMessageOptions() {

			const customEmbed = {}

			const customComponents = []

			return { customEmbed, customComponents }
		}

		const { customEmbed, customComponents } = await getMessageOptions()

		let customMsg
		try {
			customMsg = await interaction.reply({ embeds: [customEmbed], components: customComponents, fetchReply: true })
		}
		catch (error) {
			console.log(error)
			return ActionController.removeAction(interaction.user.id, ['characters_command'])
		}

		const filter = (i) => i.user.id === interaction.user.id

		const collector = customMsg.createMessageComponentCollector({ filter, time: 1000 * 60 * 5 })

		const customCharacter = async () => {
			const customEmbed = new EmbedBuilder()
				.setTitle(LanguagesController.content('messages.characters.customCharacter.title'))
				.setDescription(LanguagesController.content('messages.characters.customCharacter.description'))
				.setColor('#313236')
				.setImage('https://i.imgur.com/FBicrHc.png')

			if (action.custom === 'top') {
				customEmbed.setColor('#0000ff')
			}
			else if (action.custom === 'mid') {
				customEmbed.setColor('#00ff00')
			}
			else if (action.custom === 'random') {
				customEmbed.setColor('#ff0000')
			}

			const customComponents = [
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('selectcustom')
						.setPlaceholder(LanguagesController.content('messages.characters.customCharacter.description'))
						.addOptions([
							{
								label: LanguagesController.content('nouns.top'),
								value: 'top',
								emoji: '🔵',
								default: action.custom === 'top',
							},
							{
								label: LanguagesController.content('nouns.mid'),
								value: 'mid',
								emoji: '🟢',
								default: action.custom === 'mid',
							},
							{
								label: LanguagesController.content('nouns.bot'),
								value: 'bot',
								emoji: '🔴',
								default: action.custom === 'bot',
							},
						]),
				]),
			]

			return { customEmbed, customComponents }
		}

		collector.on('collect', async (i) => {
			i.deferUpdate().then(() => {
				// code
			})
		})

		collector.on('end', async () => {
			// ActionController.removeAction(interaction.user.id, ['mycharacter_command'])
			if (action.concluded) return
			const newCharactersMsg = await interaction.channel.messages.fetch(customMsg.id)

			disableAllComponents(newCharactersMsg)
		})

	}
}