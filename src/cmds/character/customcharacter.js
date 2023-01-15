const BaseCommand = require('../../utils/BaseCommand')
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js')
const disableAllComponents = require('../../utils/disableAllComponents')
const CharacterController = require('../../controllers/CharacterController')
const ActionsController = require('../../controllers/ActionsController')
const randomString = require('../../utils/randomString')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.customcharacter.name'),
			description: client.languages.content('commands.customcharacter.description'),
			permissions: ['user'],
		})
	}
	async execute(interaction) {

		const ActionController = new ActionsController(this.client.redisCache)

		if (await ActionController.inAction(interaction.user.id, 'customcharacter_command')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.customcharacter_command_already'), ephemeral: true })
		}

		if (await ActionController.inAction(interaction.user.id, 'use_character')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.use_character_already'), ephemeral: true })
		}

		const command_handler = randomString(16)

		await ActionController.addAction(interaction.user.id, { id: 'customcharacter_command', duration: 60 * 12, handler: command_handler })
		await ActionController.addAction(interaction.user.id, { id: 'use_character', handler: command_handler, type: 'customcharacter' })

		const LanguagesController = this.client.languages

		const Character = new CharacterController(this.client, interaction.user)

		const action = {
			reset: async () => {
				action.user_id = interaction.user.id
				action.parts = new Map()
				action.dataparts = JSON.parse(await this.client.redisCache.get('config:skins.json'))
			},
		}

		await action.reset()

		const getCustomMenus = async () => {

			const actions = [ { name: 'home', emoji: '🏠' }, { name: 'save', emoji: '💾' }, { name: 'cancel', emoji: '❌' }, { name: 'reset', emoji: '🔁' } ]

			const editcomponents = [ { name: 'reset', emoji: '🔁' }, { name: 'layer', emoji: '🔺' }, { name: 'color', emoji: '🎨' }, { name: 'position', emoji: '📏' }, { name: 'size', emoji: '📐' }, { name: 'flip', emoji: '🔴' }, { name: 'mirror', emoji: '🪞' }, { name: 'filter', emoji: '🔴' } ]

			const parts = Object.keys(action.dataparts.all)

			const skincomponents = action.dataparts.all[action.selectedpart] || ['default']

			const skinAttachment = action.skinBuffer ? new AttachmentBuilder(action.skinBuffer, { name: 'skin.png' }) : null

			const menuEmbed = new EmbedBuilder()
				.setTitle(LanguagesController.content('messages.characters.customCharacter.title'))
				.setDescription(LanguagesController.content('messages.characters.customCharacter.description'))
				.setColor('#313236')
				.setImage(skinAttachment ? 'attachment://skin.png' : 'https://i.imgur.com/UFuYQoU.png')
				.setColor('#0000ff')

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
								default: action.parts.get(action.selectedpart)?.component === skincomponent,
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

		const { menuEmbed, menuComponents } = await getCustomMenus()

		let customMsg
		try {
			customMsg = await interaction.reply({ embeds: [menuEmbed], components: menuComponents, fetchReply: true })
		}
		catch (error) {
			console.log(error)
			return ActionController.removeAction(interaction.user.id, ['customcharacter_command', 'use_character'])
		}

		const filter = (i) => i.user.id === interaction.user.id

		const collector = customMsg.createMessageComponentCollector({ filter, time: 1000 * 60 * 5 })

		collector.on('update_menu_message', async () => {
			// eslint-disable-next-line no-shadow
			const { menuEmbed, menuComponents, menuFiles } = await getCustomMenus()
			await customMsg.edit({ attachments: [], embeds: [menuEmbed], components: menuComponents, files: menuFiles })
		})

		collector.on('collect', async (i) => {
			i.deferUpdate().then(async () => {
				if (i.customId === 'makeaction') {
					action.action = i.values[0]

					if (action.action === 'reset') {
						await action.reset()
						action.custom = 'avatar'
						collector.emit('update_menu_message')
						return
					}

				}
				else if (i.customId === 'selectpart') {
					action.selectedpart = i.values[0]
					collector.emit('update_menu_message')
				}
				else if (i.customId === 'selectcomponent') {
					action.selectedcomponent = i.values[0]

					const skindata = await this.client.redisCache.get(`skins:resources/characters/skins/${action.selectedpart}/${action.selectedcomponent}.png`)

					action.parts.set(action.selectedpart, {
						component: action.selectedcomponent,
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
			ActionController.removeAction(interaction.user.id, ['customcharacter_command', 'use_character'])
			if (action.concluded) return
			const newCharactersMsg = await interaction.channel.messages.fetch(customMsg.id)

			disableAllComponents(newCharactersMsg)
		})

	}
}