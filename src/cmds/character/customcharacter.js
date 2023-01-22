const BaseCommand = require('../../utils/BaseCommand')
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js')
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

		const redisCache = this.client.redisCache

		const ActionController = new ActionsController(redisCache)

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
				action.dataparts = JSON.parse(await redisCache.get('config:skins.json'))
				action.selectedpart = undefined
				action.skinBuffer = undefined
				action.selectedcomponent = undefined
			},
		}

		await action.reset()

		const getCustomMenus = async () => {

			const parts = Object.keys(action.dataparts.all)
			const actions = [ { name: 'save', emoji: '💾' }, { name: 'cancel', emoji: '❌' }, { name: 'templates', emoji: '📋' }, { name: 'reset', emoji: '🔁' } ]
			const editcomponents = [ { name: 'reset', emoji: '🔁' }, { name: 'layer', emoji: '🔺' }, { name: 'color', emoji: '🎨' }, { name: 'position', emoji: '📏' }, { name: 'scale', emoji: '📐' }, { name: 'flip', emoji: '🔃' }, { name: 'mirror', emoji: '🪞' } ]

			for (let i = 0; i < editcomponents.length; i++) {
				const component = action.parts.get(action.selectedpart)?.[editcomponents[i].name]
				if (component === false || component === true) {
					editcomponents[i].value = LanguagesController.content(`nouns.${component}`)
				}
				else if (component !== undefined) {
					editcomponents[i].value = typeof component === 'object' ? Object.entries(component).map((entry) => `${entry[0]}: ${entry[1]}`).join(', ') : component
				}
			}

			const skincomponents = action.dataparts.all[action.selectedpart] || ['default']
			const skinAttachment = action.skinBuffer ? new AttachmentBuilder(action.skinBuffer, { name: 'skin.png' }) : null

			const menuEmbed = new EmbedBuilder()
				.setTitle(LanguagesController.content('messages.characters.customCharacter.title'))
				.setDescription(LanguagesController.content('messages.characters.customCharacter.description'))
				.setColor('#313236')
				.setImage(skinAttachment ? 'attachment://skin.png' : 'https://i.imgur.com/UFuYQoU.png')
				.setColor('#0000ff')

			const menuOptions = {
				'actions': actions.map((clickaction) => {
					return {
						label: LanguagesController.content(`nouns.${clickaction.name}`),
						value: clickaction.name,
						emoji: clickaction.emoji,
					}
				}),
				'parts': parts.map((part) => {
					return {
						label: `${LanguagesController.content(`nouns.${part}`)} ${action.dataparts.required.includes(part) ? `(${LanguagesController.content('nouns.required')} *)` : ''}`,
						value: part,
						emoji: '👋',
						default: action.selectedpart === part,
					}
				}),
				'skincomponents': skincomponents.map((skincomponent) => {
					return {
						label: `${LanguagesController.content('nouns.component')}: ${skincomponent}`,
						value: skincomponent,
						emoji: '🥪',
						default: action.parts.get(action.selectedpart)?.component === skincomponent,
					}
				}),
				'editcomponents': editcomponents.map((editcomponent) => {
					return {
						label: `${LanguagesController.content(`nouns.${editcomponent.name}`)} ${editcomponent.value ? `(${editcomponent.value})` : ''}`,
						value: editcomponent.name,
						emoji: editcomponent.emoji,
					}
				}),
			}

			menuOptions.skincomponents.unshift({
				label: LanguagesController.content('nouns.none'),
				value: 'none',
				emoji: '🥪',
				default: action.parts.get(action.selectedpart)?.component === 'none' || !action.parts.get(action.selectedpart)?.component,
			})

			const menuComponents = [
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('makeaction')
						.setPlaceholder(LanguagesController.content('nouns.makeaction'))
						.addOptions(menuOptions.actions),
				]),
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('selectpart')
						.setPlaceholder(LanguagesController.content('messages.characters.customCharacter.selectpart'))
						.addOptions(menuOptions.parts),
				]),
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('selectcomponent')
						.setPlaceholder(LanguagesController.content('messages.characters.customCharacter.selectcomponent'))
						.setDisabled(action.selectedpart ? false : true)
						.addOptions(menuOptions.skincomponents),
				]),
				new ActionRowBuilder().addComponents([
					new StringSelectMenuBuilder()
						.setCustomId('editcomponent')
						.setPlaceholder(LanguagesController.content('nouns.editcomponent'))
						.setDisabled(action.parts.get(action.selectedpart)?.component ? false : true)
						.addOptions(menuOptions.editcomponents),
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

		async function resetPartOptions(part) {
			const partOptions = action.parts.get(part)
			action.parts.set(part, {
				component: partOptions.component,
				part: partOptions.part,
				skin: partOptions.skin,
				color: '#000000',
				position: { x: 0, y: 0 },
				rotation: 0,
				scale: 1,
				opacity: 1,
				flip: false,
				mirror: false,
				layer: 0,
			})
		}

		async function setNewComponent() {
			const partOptions = action.parts.get(action.selectedpart)
			action.parts.set(action.selectedpart, partOptions)
			action.skinBuffer = await Character.makeSkinBuffer(action.parts.values())
			collector.emit('update_menu_message')
		}

		async function selectPart(part) {
			try {
				action.selectedpart = part
				collector.emit('update_menu_message')
			}
			catch (error) {
				console.log(error)
				return interaction.followUp({ content: LanguagesController.content('messages.characters.customCharacter.error'), ephemeral: true })
			}
		}

		async function selectComponent(component) {
			try {
				action.selectedcomponent = component

				if (action.selectedcomponent === 'none') {
					action.parts.delete(action.selectedpart)
				}
				else {
					const skindata = await redisCache.get(`skins:resources/characters/skins/${action.selectedpart}/${action.selectedcomponent}.png`)
					action.parts.set(action.selectedpart, {
						component: action.selectedcomponent,
						part: action.selectedpart,
						skin: JSON.parse(skindata),
					})
					await resetPartOptions(action.selectedpart)
				}

				action.skinBuffer = await Character.makeSkinBuffer(action.parts.values())

				collector.emit('update_menu_message')
			}
			catch (error) {
				console.log(error)
				return interaction.followUp({ content: LanguagesController.content('messages.characters.customCharacter.error'), ephemeral: true })
			}
		}

		async function editComponentModal(type, toModalInteraction) {
			const partOptions = action.parts.get(action.selectedpart)

			const componentModal = new ModalBuilder()
				.setTitle(LanguagesController.content('messages.characters.customCharacter.editcomponent.title', { part: action.selectedpart, type: `{%nouns.${type}}` }))
				.setCustomId('edit_component_modal')

			const componentModalRows = []

			async function collectModalSubmit() {
				toModalInteraction.awaitModalSubmit({ filter, time: 30_000 })
					.then(modalInteraction => {
						if (type === 'color') {
							const colorInput = modalInteraction.fields.getTextInputValue('colorInput')
							if (colorInput) {
								partOptions.color = colorInput
							}
						}
						else if (type === 'position') {
							const positionXInput = modalInteraction.fields.getTextInputValue('positionXInput')
							const positionYInput = modalInteraction.fields.getTextInputValue('positionYInput')
							if (positionXInput && positionYInput) {
								partOptions.position = { x: Number(positionXInput), y: Number(positionYInput) }
							}
						}
						else if (type === 'rotation') {
							const rotationInput = modalInteraction.fields.getTextInputValue('rotationInput')
							if (rotationInput) {
								partOptions.rotation = Number(rotationInput)
							}
						}
						else if (type === 'scale') {
							const scaleInput = modalInteraction.fields.getTextInputValue('scaleInput')
							if (scaleInput) {
								partOptions.scale = Number(scaleInput)
							}
						}
						else if (type === 'opacity') {
							const opacityInput = modalInteraction.fields.getTextInputValue('opacityInput')
							if (opacityInput) {
								partOptions.opacity = Number(opacityInput)
							}
						}
						else if (type === 'layer') {
							const layerInput = modalInteraction.fields.getTextInputValue('layerInput')
							if (layerInput) {
								partOptions.layer = Number(layerInput)
							}
						}
						setNewComponent()
						modalInteraction.deferUpdate()
					}).catch(() => {
						toModalInteraction.followUp({ content: LanguagesController.content('messages.characters.customCharacter.editcomponent.error'), ephemeral: true })
					})
			}

			async function getEditColorBuilder() {
				const colorInputBuilder = new TextInputBuilder()
					.setCustomId('colorInput')
					.setLabel(LanguagesController.content('messages.characters.customCharacter.editcomponent.colortitle'))
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('#ffffff')
					.setMinLength(7)
					.setMaxLength(7)
					.setValue(partOptions.color)
				return colorInputBuilder
			}

			async function getEditPositionBuilder() {
				const positionXInputBuilder = new TextInputBuilder()
					.setCustomId('positionXInput')
					.setLabel(LanguagesController.content('messages.characters.customCharacter.editcomponent.positionxtitle'))
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('0')
					.setMinLength(1)
					.setMaxLength(3)
					.setValue(partOptions.position.x.toString())
				const positionYInputBuilder = new TextInputBuilder()
					.setCustomId('positionYInput')
					.setLabel(LanguagesController.content('messages.characters.customCharacter.editcomponent.positionytitle'))
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('0')
					.setMinLength(1)
					.setMaxLength(3)
					.setValue(partOptions.position.y.toString())
				return [positionXInputBuilder, positionYInputBuilder]
			}

			async function getEditRotationBuilder() {
				const rotationInputBuilder = new TextInputBuilder()
					.setCustomId('rotationInput')
					.setLabel(LanguagesController.content('messages.characters.customCharacter.editcomponent.rotationtitle'))
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('0')
					.setMinLength(1)
					.setMaxLength(3)
					.setValue(partOptions.rotation.toString())
				return rotationInputBuilder
			}

			async function getEditScaleBuilder() {
				const scaleInputBuilder = new TextInputBuilder()
					.setCustomId('scaleInput')
					.setLabel(LanguagesController.content('messages.characters.customCharacter.editcomponent.scaletitle') + ' (Max: 1.25)')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('1')
					.setMinLength(1)
					.setMaxLength(4)
					.setValue(partOptions.scale.toString())
					.setPlaceholder('1.25')
				return scaleInputBuilder
			}

			async function getEditOpacityBuilder() {

				const opacityInputBuilder = new TextInputBuilder()
					.setCustomId('opacityInput')
					.setLabel(LanguagesController.content('messages.characters.customCharacter.editcomponent.opacitytitle'))
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('1')
					.setMinLength(1)
					.setMaxLength(3)
					.setValue(partOptions.opacity.toString())
				return opacityInputBuilder
			}

			async function getEditLayerBuilder() {

				const layerInputBuilder = new TextInputBuilder()
					.setCustomId('layerInput')
					.setLabel(LanguagesController.content('messages.characters.customCharacter.editcomponent.layertitle'))
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('0')
					.setMinLength(1)
					.setMaxLength(3)
					.setValue(partOptions.layer.toString())
				return layerInputBuilder
			}

			switch (type) {
			case 'reset': {
				await resetPartOptions(action.selectedpart)
				setNewComponent()
				return toModalInteraction.deferUpdate()
			}
			case 'color': {
				const colorRow = new ActionRowBuilder().addComponents(await getEditColorBuilder())
				componentModalRows.push(colorRow)
				break
			}
			case 'position': {
				const [positionXInputBuilder, positionYInputBuilder] = await getEditPositionBuilder()
				const positionXRow = new ActionRowBuilder().addComponents(positionXInputBuilder)
				const positionYRow = new ActionRowBuilder().addComponents(positionYInputBuilder)
				componentModalRows.push(positionXRow, positionYRow)
				break
			}
			case 'rotation': {
				const rotationRow = new ActionRowBuilder().addComponents(await getEditRotationBuilder())
				componentModalRows.push(rotationRow)
				break
			}
			case 'scale': {
				const scaleRow = new ActionRowBuilder().addComponents(await getEditScaleBuilder())
				componentModalRows.push(scaleRow)
				break
			}
			case 'opacity': {
				const opacityRow = new ActionRowBuilder().addComponents(await getEditOpacityBuilder())
				componentModalRows.push(opacityRow)
				break
			}
			case 'flip': {
				partOptions.flip = !partOptions.flip
				break
			}
			case 'mirror': {
				partOptions.mirror = !partOptions.mirror
				break
			}
			case 'layer': {
				const layerRow = new ActionRowBuilder().addComponents(await getEditLayerBuilder())
				componentModalRows.push(layerRow)
				break
			}
			}

			if (['flip', 'mirror'].includes(type)) {
				return toModalInteraction.deferUpdate().then(async () => {
					await setNewComponent()
				})
			}

			componentModal.addComponents(...componentModalRows)

			await toModalInteraction.showModal(componentModal)

			collectModalSubmit()
		}

		async function reset() {
			await action.reset()
			collector.emit('update_menu_message')
		}

		async function cancel() {
			collector.stop()
		}

		async function save() {
			try {

				const requiredParts = action.dataparts.required

				const missingParts = requiredParts.filter((part) => !action.parts[part])

				if (missingParts.length > 0) {
					return interaction.reply({ content: LanguagesController.content('messages.characters.customCharacter.missingParts', { parts: missingParts.join(', ') }), ephemeral: true })
				}

				const skinData = {
					buffer: action.buffer,
					parts: action.parts,
				}
				await Character.setSkin(action.character, skinData)
				action.concluded = true
				return collector.stop()
			}
			catch (error) {
				console.log(error)
				return interaction.reply({ content: LanguagesController.content('messages.characters.customCharacter.error'), ephemeral: true })
			}
		}

		async function showTemplates(templatesInteraction) {

			async function getTemplatesComponents() {
				const templates = action.dataparts.templates
				const templatesComponents = templates.map((template) => {
					const templateName = Object.keys(template)[0]
					return new ButtonBuilder()
						.setCustomId(`template_${templateName}`)
						.setLabel(templateName)
						.setStyle(ButtonStyle.Primary)
				})
				return templatesComponents
			}

			async function collectTemplateSelect(templateMessage) {
				const templateCollector = templateMessage.createMessageComponentCollector({ filter, time: 1000 * 60 * 5 })
				templateCollector.on('collect', async (templateInteraction) => {
					if (templateInteraction.customId.startsWith('template_')) {
						const templateId = templateInteraction.customId.split('_')[1]
						try {
							await selectTemplate(templateId)
							templateInteraction.deferUpdate().then(() => {
								templateInteraction.editReply({ content: LanguagesController.content('messages.characters.customCharacter.templateselected', { template: templateId }), components: [] })
								templateCollector.stop()
							})
						}
						catch (error) {
							console.log(error)
							templateInteraction.editReply({ content: LanguagesController.content('messages.characters.customCharacter.error'), ephemeral: true, components: [] })
							templateCollector.stop()
						}
					}
				})
			}

			const templatesComponents = await getTemplatesComponents()
			const rowTemplatesComponents = []
			for (let i = 0; i < templatesComponents.length; i += 5) {
				rowTemplatesComponents.push(new ActionRowBuilder().addComponents(templatesComponents.slice(i, i + 5)))
			}
			const templateMessage = await templatesInteraction.followUp({ content: LanguagesController.content('messages.characters.customCharacter.selecttemplate'), components: rowTemplatesComponents, fetchReply: true, ephemeral: true })
			collectTemplateSelect(templateMessage)
		}

		async function selectTemplate(templateId) {
			const template = action.dataparts.templates.find((t) => Object.keys(t)[0] === templateId)
			const templateParts = template[templateId]
			for (const part of Object.keys(templateParts)) {
				const skindata = await redisCache.get(`skins:resources/characters/skins/${part}/${templateParts[part]}.png`)
				action.parts.set(part, {
					component: templateParts[part],
					part: action.selectedpart,
					skin: JSON.parse(skindata),
				})
				await resetPartOptions(part)
			}
			action.skinBuffer = await Character.makeSkinBuffer(action.parts.values())
			collector.emit('update_menu_message')
		}

		collector.on('collect', async (i) => {
			if (i.customId === 'editcomponent') {
				return editComponentModal(i.values[0], i)
			}
			i.deferUpdate().then(async () => {
				if (i.customId === 'makeaction') {
					action.action = i.values[0]
					switch (action.action) {
					case 'reset':
						return reset()
					case 'cancel':
						return cancel()
					case 'save':
						return save()
					case 'templates':
						return showTemplates(i)
					}
				}
				else if (i.customId === 'selectpart') {
					selectPart(i.values[0])
				}
				else if (i.customId === 'selectcomponent') {
					selectComponent(i.values[0])
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