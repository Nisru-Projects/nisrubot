const BaseCommand = require('../../utils/BaseCommand')
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js')
const disableAllComponents = require('../../utils/disableAllComponents')
const CharacterController = require('../../controllers/CharacterController')
const ActionsController = require('../../controllers/ActionsController')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.customcharacter.name'),
			description: client.languages.content('commands.customcharacter.description'),
			permissions: ['user'],
		})
	}
	async execute(interaction, characters) {

		const ActionController = new ActionsController(this.client.redisCache)

		if (await ActionController.inAction(interaction.user.id, 'customcharacter_command')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.customcharacter_command_already'), ephemeral: true })
		}

		await ActionController.addAction(interaction.user.id, { id: 'customcharacter_command', duration: 60 * 12 })

		const LanguagesController = this.client.languages

		const Character = new CharacterController(this.client, interaction.user)

		const action = {
			reset: () => {
				action.user_id = interaction.user.id
				action.parts = new Map()
			},
		}

		action.reset()

		action.dataparts = JSON.parse(await this.client.redisCache.get('skins:data'))

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

		const getCustomMenus = async () => {

			const actions = [ { name: 'home', emoji: '🏠' }, { name: 'update', emoji: '🔄' }, { name: 'save', emoji: '💾' }, { name: 'cancel', emoji: '❌' }, { name: 'reset', emoji: '🔁' } ]

			const editcomponents = [ { name: 'reset', emoji: '🔁' }, { name: 'layer', emoji: '🔺' }, { name: 'color', emoji: '🎨' }, { name: 'position', emoji: '📏' }, { name: 'size', emoji: '📐' }, { name: 'flip', emoji: '🔴' }, { name: 'mirror', emoji: '🪞' }, { name: 'filter', emoji: '🔴' } ]

			const partsbackgrounds = [ { part: 'top', background: 'https://i.imgur.com/UFuYQoU.png' }, { part: 'mid', background: 'https://i.imgur.com/tD3Sy5z.png' }, { part: 'bot', background: 'https://i.imgur.com/SOhtuh4.png' } ]

			const parts = Object.keys(action.dataparts.all[action.custom])

			const skincomponents = action.dataparts.all[action.custom][action.selectedpart] || ['default']

			const skinAttachment = action.skinBuffer ? new AttachmentBuilder(action.skinBuffer, { name: 'skin.png' }) : null

			console.log('skinAttach', skinAttachment)

			const menuEmbed = new EmbedBuilder()
				.setTitle(LanguagesController.content('messages.characters.customCharacter.title'))
				.setDescription(LanguagesController.content('messages.characters.customCharacter.description'))
				.setColor('#313236')
				.setImage(skinAttachment ? 'attachment://skin.png' : partsbackgrounds.find((part) => part.part === action.custom).background)

			const customColor = {
				top: '#0000ff',
				mid: '#00ff00',
				bot: '#ff0000',
			}

			menuEmbed.setColor(customColor[action.custom])

			const menuComponents = [
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('makeaction')
						.setPlaceholder(LanguagesController.content('nouns.makeaction'))
						// eslint-disable-next-line no-shadow
						.addOptions(actions.map((action) => {
							return {
								label: LanguagesController.content(`nouns.${action.name}`),
								value: action.name,
								emoji: action.emoji,
							}
						})),
				]),
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('selectpart')
						.setPlaceholder(LanguagesController.content('messages.characters.customCharacter.selectpart'))
						.addOptions(parts.map((part) => {
							return {
								label: LanguagesController.content(`nouns.${part}`),
								value: part,
								emoji: '👋',
								default: action.selectedpart === part,
							}
						})),
				]),
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('selectcomponent')
						.setPlaceholder(LanguagesController.content('messages.characters.customCharacter.selectcomponent'))
						.setDisabled(action.selectedpart ? false : true)
						.addOptions(skincomponents.map((skincomponent) => {
							return {
								label: `${LanguagesController.content('nouns.component')}: ${skincomponent}`,
								value: skincomponent,
								emoji: '🥪',
								default: action.selectedcomponent === skincomponent,
							}
						})),
				]),
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('editcomponent')
						.setPlaceholder(LanguagesController.content('nouns.editcomponent'))
						.setDisabled(action.selectedcomponent ? false : true)
						.addOptions(editcomponents.map((editcomponent) => {
							return {
								label: LanguagesController.content(`nouns.${editcomponent.name}`),
								value: editcomponent.name,
								emoji: editcomponent.emoji,
							}
						})),
				]),
			]

			return { menuEmbed, menuComponents, menuFiles: skinAttachment ? [skinAttachment] : [] }

		}

		const { customEmbed, customComponents } = await customCharacter()

		let customMsg
		try {
			customMsg = await interaction.reply({ embeds: [customEmbed], components: customComponents, fetchReply: true })
		}
		catch (error) {
			console.log(error)
			return ActionController.removeAction(interaction.user.id, ['customcharacter_command'])
		}

		const filter = (i) => i.user.id === interaction.user.id

		const collector = customMsg.createMessageComponentCollector({ filter, time: 1000 * 60 * 5 })

		collector.on('update_menu_message', async () => {
			const { menuEmbed, menuComponents, menuFiles } = await getCustomMenus()
			await customMsg.edit({ attachments: [], embeds: [menuEmbed], components: menuComponents, files: menuFiles })
		})

		collector.on('collect', async (i) => {
			i.deferUpdate().then(async () => {
				if (i.customId === 'makeaction') {
					action.action = i.values[0]

					if (action.action === 'update') {
						return collector.emit('update_skin')
					}

				}

				if (i.customId === 'selectcustom') {
					action.custom = i.values[0]

					if (!Object.keys(action.dataparts.all).includes(action.custom)) {
						return i.followUp({ content: LanguagesController.content('messages.characters.customCharacter.noPart', { part: action.custom }), ephemeral: true })
					}

					collector.emit('update_menu_message')
				}
				else if (i.customId === 'selectpart') {
					action.selectedpart = i.values[0]

					collector.emit('update_menu_message')
				}
				else if (i.customId === 'selectcomponent') {
					action.selectedcomponent = i.values[0]

					const skindata = await this.client.redisCache.get(`skins:resources/characters/skins/${action.custom}/${action.selectedpart}/${action.selectedcomponent}.png`)

					action.parts.set(`${action.selectedpart}/${action.selectedcomponent}`, {
						part: action.selectedpart,
						skin: JSON.parse(skindata),
						color: '#ffffff',
						position: { x: 0, y: 0 },
						rotation: 0,
						scale: 1,
						opacity: 1,
						flip: false,
						mirror: false,
						layer: 0,
					})

					action.skinBuffer = await Character.makeSkinBuffer(action.parts.values())

					await collector.emit('update_menu_message')
				}
			})
		})

		collector.on('end', async () => {
			ActionController.removeAction(interaction.user.id, ['customcharacter_command'])
			if (action.concluded) return
			const newCharactersMsg = await interaction.channel.messages.fetch(customMsg.id)

			disableAllComponents(newCharactersMsg)
		})

	}
}