const BaseCommand = require('../../utils/BaseCommand')
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const disableAllButtons = require('../../utils/disableAllButtons')
const CharacterController = require('../../controllers/CharacterController')
const ActionsController = require('../../controllers/ActionsController')
const { calculateLevel } = require('../../utils/levelingForms')
const uppercaseFirstLetter = require('../../utils/uppercaseFirstLetter')

const elements = [
	{ name: 'fire', value: 'fire', emoji: '🔥', description: 'Fire', selected: true },
	{ name: 'water', value: 'water', emoji: '💧', description: 'Water', selected: true },
	{ name: 'earth', value: 'earth', emoji: '🌎', description: 'Earth', selected: true },
	{ name: 'air', value: 'air', emoji: '💨', description: 'Air', selected: true },
	{ name: 'light', value: 'light', emoji: '🌞', description: 'Light', selected: true },
	{ name: 'dark', value: 'dark', emoji: '🌑', description: 'Dark', selected: true },
]

const constellations = [
	{ name: 'aquarius', value: 'aquarius', emoji: '♒', description: 'Aquarius', selected: true, blessings: ['water', 'air'] },
	{ name: 'aries', value: 'aries', emoji: '♈', description: 'Aries', selected: true, blessings: ['fire', 'air'] },
	{ name: 'cancer', value: 'cancer', emoji: '♋', description: 'Cancer', selected: true, blessings: ['water', 'earth'] },
	{ name: 'capricorn', value: 'capricorn', emoji: '♑', description: 'Capricorn', selected: true, blessings: ['earth', 'fire'] },
	{ name: 'gemini', value: 'gemini', emoji: '♊', description: 'Gemini', selected: true, blessings: ['air', 'light'] },
	{ name: 'leo', value: 'leo', emoji: '♌', description: 'Leo', selected: true, blessings: ['fire', 'light'] },
	{ name: 'libra', value: 'libra', emoji: '♎', description: 'Libra', selected: true, blessings: ['air', 'dark'] },
	{ name: 'pisces', value: 'pisces', emoji: '♓', description: 'Pisces', selected: true, blessings: ['water', 'dark'] },
	{ name: 'sagittarius', value: 'sagittarius', emoji: '♐', description: 'Sagittarius', selected: true, blessings: ['earth', 'air'] },
	{ name: 'scorpio', value: 'scorpio', emoji: '♏', description: 'Scorpio', selected: true, blessings: ['water', 'fire'] },
	{ name: 'taurus', value: 'taurus', emoji: '♉', description: 'Taurus', selected: true, blessings: ['earth', 'water'] },
	{ name: 'virgo', value: 'virgo', emoji: '♍', description: 'Virgo', selected: true, blessings: ['earth', 'dark'] },
]

const races = [
	{
		name: 'human',
		value: 'human',
		emoji: '👨',
		description: 'Human',
		selected: true,
		history: 'Human history',
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1,
		},
	},
	{
		name: 'elf',
		value: 'elf',
		emoji: '🧝',
		description: 'Elf',
		selected: true,
		history: 'Elf history',
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1,
		},
	},
	{
		name: 'dwarf',
		value: 'dwarf',
		emoji: '🧔',
		description: 'Dwarf',
		selected: true,
		history: 'Dwarf history',
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1,
		},
	},
	{
		name: 'orc',
		value: 'orc',
		emoji: '👹',
		description: 'Orc',
		selected: true,
		history: 'Orc history',
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1,
		},
	},
	{
		name: 'gnome',
		value: 'gnome',
		emoji: '🧙',
		description: 'Gnome',
		selected: true,
		history: 'Gnome history',
		baseAttributes: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			intelligence: 1,
			wisdom: 1,
			charisma: 1,
		},
	},
]

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.characters.name'),
			description: client.languages.content('commands.characters.description'),
			permissions: ['user'],
		})
	}
	async execute(interaction, characters) {

		const ActionController = new ActionsController(this.client.redisCache)

		if (await ActionController.inAction(interaction.user.id, 'characters_command')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.characters_command_already'), ephemeral: true })
		}

		await ActionController.addAction(interaction.user.id, { id: 'characters_command', duration: 60 * 12 })

		const LanguagesController = this.client.languages

		const Character = new CharacterController(this.client, interaction.user)

		const action = {
			possiblesConstellations: constellations.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * (5 - 2 + 1) + 2)),
			reset: () => {
				action.name = ''
				action.active = false
				action.step = 0
				action.stepMax = 2
				action.character = {
					user_id: interaction.user.id,
				}
			},
		}

		action.reset()

		async function menuEmbed(i) {

			async function getCharactersComponents() {

				const charactersFields = []
				const charactersButtons = []
				const customButtons = []

				for (const character_id of characters.characters) {
					const character = (await Character.getCharacterInfo(character_id, 'characters_geral'))['characters_geral.*']
					charactersFields.push({ name: character.essence.name, value: calculateLevel(character.exp).toString() })
					charactersButtons.push(
						new ButtonBuilder()
							.setCustomId(`chselect${character.character_id}`)
							.setLabel(LanguagesController.content('messages.characters.charactersButtons.select', { character_name: character.essence.name }))
							.setEmoji(character.character_id === characters.selected_character ? '✅' : '👤')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(character.character_id === characters.selected_character),
					)
				}

				if (characters.selected_character) {
					const selected_character = (await Character.getCharacterInfo(characters.selected_character, 'characters_geral'))['characters_geral.*']
					customButtons.push(
						new ButtonBuilder()
							.setCustomId('customize')
							.setLabel(LanguagesController.content('messages.characters.charactersButtons.customize', { character_name: selected_character.essence.name }))
							.setEmoji('1054051525204385882')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('delete')
							.setLabel(LanguagesController.content('messages.characters.charactersButtons.delete', { character_name: selected_character.essence.name }))
							.setStyle(ButtonStyle.Danger),
						new ButtonBuilder()
							.setCustomId('sell')
							.setLabel(LanguagesController.content('messages.characters.charactersButtons.sell', { character_name: selected_character.essence.name }))
							.setStyle(ButtonStyle.Success),
					)
				}

				return { charactersFields, charactersButtons, customButtons }

			}

			const { charactersFields, charactersButtons, customButtons } = await getCharactersComponents()

			const charactersEmbed = {
				color: 0x36393f,
				title: LanguagesController.content('messages.characters.charactersEmbed.title'),
				timestamp: new Date().toISOString(),
				fields: charactersFields,
				description: LanguagesController.content('messages.characters.charactersEmbed.description', { has_character: characters.characters.length > 0 }),
			}

			const actionsButtons = [
				new ButtonBuilder()
					.setCustomId('create')
					.setLabel(LanguagesController.content('messages.characters.charactersButtons.create'))
					.setEmoji('👤')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(await ActionController.inAction(interaction.user.id, 'create_character')),
			]

			const charactersComponents = []

			charactersComponents.push(new ActionRowBuilder().addComponents([...actionsButtons, ...charactersButtons]))
			if (customButtons.length > 0) charactersComponents.push(new ActionRowBuilder().addComponents(customButtons))

			if (i && !['confirm', 'cancel', 'confirmcreation'].includes(i.customId) && !i.customId.includes('chselect')) {
				const checkButtons = (type) => {
					return [
						new ButtonBuilder()
							.setCustomId('confirm')
							.setLabel(LanguagesController.content('messages.characters.creationCharacterDefaults.confirm', { option: `{%messages.characters.creationCharacterDefaults.${type.toLowerCase()}Option}` }))
							.setEmoji('✅')
							.setStyle(ButtonStyle.Success),
						new ButtonBuilder()
							.setCustomId('cancel')
							.setLabel(LanguagesController.content('messages.characters.creationCharacterDefaults.cancel', { option: `{%messages.characters.creationCharacterDefaults.${type.toLowerCase()}Option}` }))
							.setEmoji('❌')
							.setStyle(ButtonStyle.Danger),
					]
				}

				action.check = uppercaseFirstLetter(i.customId)
				charactersComponents.push(new ActionRowBuilder().addComponents(checkButtons(action.check)))
				charactersComponents.forEach((row) => {
					row.components.forEach((button) => {
						if (button.data.custom_id === i.customId) button.data.disabled = true
					})
				})
			}

			return { charactersEmbed, charactersComponents }

		}

		const { charactersEmbed, charactersComponents } = await menuEmbed()

		let charactersMsg
		try {
			charactersMsg = await interaction.reply({ embeds: [charactersEmbed], components: charactersComponents, fetchReply: true })
		}
		catch (error) {
			console.log(error)
			return ActionController.removeAction(interaction.user.id, ['characters_command'])
		}

		const filter = (i) => i.user.id === interaction.user.id

		const collector = charactersMsg.createMessageComponentCollector({ filter, time: 1000 * 60 * 10 })

		const validateCharacter = () => {
			const stepsValidations = {
				0: ['name', 'gender'],
				1: ['race', 'element'],
				2: ['constellation', 'gamemode'],
			}
			const allValidations = Object.values(stepsValidations).flat()
			return { stepsValidations, all: allValidations.map((validation) => action.character[validation]), step: stepsValidations[action.step].map((validation) => action.character[validation]) }
		}

		const creationCharacter = async () => {

			const showRequired = () => {
				return validateCharacter().step.map((validation) => validation ? '✅' : '❌').join(' ')
			}

			const creationEmbed = {
				color: 0x36393f,
				title: LanguagesController.content('messages.characters.charactersEmbed.creationtitle', { currentpage: action.step + 1, totalpages: action.stepMax + 1 }),
				timestamp: new Date().toISOString(),
				description: ` ${showRequired()} __${LanguagesController.content(`messages.characters.creationCharacterStepDescription.step${action.step}`)}__`,
				fields: [],
			}

			creationEmbed.fields.push({ name: `${LanguagesController.content('nouns.name')}: ${action.character.name || LanguagesController.content('messages.utils.undefined')}`,
				value: `
${LanguagesController.content('nouns.gender')}: ${LanguagesController.content(`genders.${action.character.gender}`, { undefined: 'messages.utils.undefined' })}
${LanguagesController.content('nouns.race')}: ${LanguagesController.content(`races.${action.character.race}`, { undefined: 'messages.utils.undefined' })}
${LanguagesController.content('nouns.element')}: ${action.character.element}
${LanguagesController.content('nouns.constellation')}: ${action.character.constellation}` })
			if (action.character.baseAttributes) creationEmbed.fields.push({ name: LanguagesController.content('nouns.attributes'), value: Object.entries(action.character.baseAttributes).map((attribute) => `${attribute[0]}: ${attribute[1]}`).join('\n') })

			if (action.character.gamemode) creationEmbed.fields.push({ name: `${LanguagesController.content('nouns.gamemode')}: ${LanguagesController.content(`nouns.${action.character.gamemode}`, { undefined: 'messages.utils.undefined' })}`, value: LanguagesController.content(`messages.characters.creationCharacterDefaults.gamemode.${action.character.gamemode}`) })

			const creationComponents = () => {
				const components = [
					new ActionRowBuilder().addComponents([
						new ButtonBuilder()
							.setCustomId('back')
							.setLabel(LanguagesController.content('messages.characters.creationCharacterButtons.back'))
							.setEmoji('⬅️')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(action.step === 0),
						new ButtonBuilder()
							.setCustomId('next')
							.setLabel(LanguagesController.content('messages.characters.creationCharacterButtons.next'))
							.setEmoji('➡️')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(action.step === action.stepMax),
						new ButtonBuilder()
							.setCustomId('confirmcreation')
							.setLabel(LanguagesController.content('messages.characters.creationCharacterDefaults.confirm', { option: `{%messages.characters.creationCharacterDefaults.${action.check.toLowerCase()}Option}` }))
							.setEmoji('✅')
							.setStyle(ButtonStyle.Success)
							.setDisabled(validateCharacter().all.includes(undefined)),
						new ButtonBuilder()
							.setCustomId('cancel')
							.setLabel(LanguagesController.content('messages.characters.creationCharacterDefaults.cancel', { option: `{%messages.characters.creationCharacterDefaults.${action.check.toLowerCase()}Option}` }))
							.setEmoji('❌')
							.setStyle(ButtonStyle.Danger),
					]),
				]

				if (action.step === 0) {
					components.push(new ActionRowBuilder().addComponents([
						new ButtonBuilder()
							.setCustomId('selectname')
							.setLabel(LanguagesController.content('messages.characters.charactersButtons.setname', { character_name: action.character.name ?? '' }))
							.setEmoji('📝')
							.setStyle(ButtonStyle.Secondary),
					]))
					components.push(new ActionRowBuilder().addComponents([
						new StringSelectMenuBuilder()
							.setCustomId('selectgender')
							.setPlaceholder(LanguagesController.content('messages.characters.creationCharacterDefaults.select', { option: '{%nouns.gender}' }))
							.addOptions([
								{
									label: LanguagesController.content('genders.male'),
									value: 'male',
									emoji: '♂️',
									default: action.character.gender === 'male',
								},
								{
									label: LanguagesController.content('genders.female'),
									value: 'female',
									emoji: '♀️',
									default: action.character.gender === 'female',
								},
								{
									label: LanguagesController.content('genders.other'),
									value: 'other',
									emoji: '🏳️‍🌈',
									default: action.character.gender === 'other',
								},
							]),
					]))
				}
				if (action.step === 1) {
					components.push(new ActionRowBuilder().addComponents([
						new StringSelectMenuBuilder()
							.setCustomId('selectrace')
							.setPlaceholder(LanguagesController.content('messages.characters.creationCharacterDefaults.select', { option: '{%nouns.race}' }))
							.addOptions(races.filter(race => race.selected).map((race) => {
								return {
									label: race.name,
									value: race.value,
									emoji: race.emoji,
									description: race.description,
									default: action.character.race === race.name,
								}
							})),
					]))
					components.push(new ActionRowBuilder().addComponents([
						new StringSelectMenuBuilder()
							.setCustomId('selectelement')
							.setPlaceholder(LanguagesController.content('messages.characters.creationCharacterDefaults.select', { option: '{%nouns.element}' }))
							.addOptions(elements.filter(element => element.selected).map((element) => {
								return {
									label: element.name,
									value: element.value,
									emoji: element.emoji,
									description: element.description,
									default: action.character.element === element.name,
								}
							})).addOptions([
								{
									label: LanguagesController.content('nouns.random'),
									value: 'random',
									emoji: '🎲',
									default: action.character.element === 'random',
								},
								{
									label: LanguagesController.content('nouns.none'),
									value: 'none',
									emoji: '❌',
									default: action.character.element === 'none',
								},
							]),
					]))
				}
				if (action.step === 2) {

					components.push(new ActionRowBuilder().addComponents([
						new StringSelectMenuBuilder()
							.setCustomId('selectconstellation')
							.setPlaceholder(LanguagesController.content('messages.characters.creationCharacterDefaults.select', { option: '{%nouns.constellation}' }))
							.addOptions(action.possiblesConstellations.map((constellation) => {
								return {
									label: constellation.name,
									value: constellation.value,
									emoji: constellation.emoji,
									description: constellation.description,
									default: action.character.constellation === constellation.name,
								}
							}))
							.addOptions([
								{
									label: LanguagesController.content('nouns.random'),
									value: 'random',
									emoji: '🎲',
									default: action.character.constellation === 'random',
								},
								{
									label: LanguagesController.content('nouns.none'),
									value: 'none',
									emoji: '❌',
									default: action.character.constellation === 'none',
								},
							]),

					]))

					components.push(new ActionRowBuilder().addComponents([
						new StringSelectMenuBuilder()
							.setCustomId('selectgamemode')
							.setPlaceholder(LanguagesController.content('messages.characters.creationCharacterDefaults.select', { option: '{%nouns.gamemode}' }))
							.addOptions([
								{
									label: LanguagesController.content('nouns.normal'),
									value: 'normal',
									emoji: '🟢',
									description: LanguagesController.content('messages.characters.creationCharacterDefaults.gamemode.normal'),
									default: action.character.gamemode === 'normal',
								},
								{
									label: LanguagesController.content('nouns.hard'),
									value: 'hard',
									emoji: '🔴',
									description: LanguagesController.content('messages.characters.creationCharacterDefaults.gamemode.hard'),
									default: action.character.gamemode === 'hard',
								},
								{
									label: LanguagesController.content('nouns.abyss'),
									value: 'abyss',
									emoji: '👿',
									description: LanguagesController.content('messages.characters.creationCharacterDefaults.gamemode.abyss'),
									default: action.character.gamemode === 'abyss',
								},
								{
									label: LanguagesController.content('nouns.random'),
									value: 'random',
									emoji: '🎲',
									description: LanguagesController.content('messages.characters.creationCharacterDefaults.gamemode.random'),
									default: action.character.gamemode === 'random',
								},
							]),

					]))

				}

				return components
			}

			if (action.concluded) {
				creationEmbed.description = LanguagesController.content('messages.characters.charactersEmbed.descriptionconclued', { character_name: action.character.name })
			}

			return { creationEmbed, creationComponents }
		}

		collector.on('update_embed_creation', async (i) => {
			const { creationEmbed, creationComponents } = await creationCharacter()
			return i.editReply({ embeds: [creationEmbed], components: action.concluded ? [] : creationComponents() })
		})

		collector.on('update_embed_menu', async (i) => {
			const { charactersEmbed: temp, charactersComponents: temp2 } = await menuEmbed(i)

			return i.editReply({ embeds: [temp], components: temp2 })
		})

		collector.on('collect', async (i) => {

			if (i.isStringSelectMenu()) {
				i.deferUpdate().then(async () => {
					action.character[i.customId.replace('select', '')] = i.values[0]
					if (['selectrace'].includes(i.customId)) {
						action.character.baseAttributes = races.find((race) => race.value == action.character.race)?.baseAttributes
					}
					if (!validateCharacter().step.includes(undefined) || (i.customId == 'selectgender' && action.character.name)) {
						collector.emit('update_embed_creation', i)
					}
				})
			}

			if (!i.isButton()) return

			if (i.customId === 'selectname') {

				const modal = new ModalBuilder()
					.setCustomId('charactername_modal')
					.setTitle(LanguagesController.content('messages.modals.character_name_modal.title'))

				const nameInput = new TextInputBuilder()
					.setCustomId('namemodal')
					.setLabel(LanguagesController.content('messages.modals.character_name_modal.fieldname').slice(0, 45))
					.setStyle(TextInputStyle.Short)
					.setMinLength(5)
					.setMaxLength(20)
					.setRequired(true)

				modal.addComponents(new ActionRowBuilder().addComponents(nameInput))

				return i.showModal(modal).then(async () => {
					const submitted = await i.awaitModalSubmit({
						time: 60000,
						// eslint-disable-next-line no-shadow
						filter: i => i.user.id === interaction.user.id,
					}).catch(() => {
						i.followUp({ content: LanguagesController, ephemeral: true })
						return null
					})

					if (submitted) {
						const character_name = submitted.fields.getTextInputValue('namemodal')
						action.character.name = character_name.toLowerCase().replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '').replace(/[^a-zA-Z ]/g, '')

						if (action.character.name.length < 5) {
							return submitted.reply({ content: LanguagesController.content('messages.modals.character_name_modal.short_name', { character_name: action.character.name }), ephemeral: true })
						}

						// Checar se já tem um personagem com esse nome, em characters_geral, coluna essence (um json) e verificar se o nome é igual ao que o usuário digitou
						const query = 'SELECT * FROM characters_geral WHERE essence->>\'name\' = ?'
						const exists = await this.client.dataManager.query(query, [character_name])

						if (exists.rows.length > 0) {
							return submitted.reply({ content: LanguagesController.content('messages.modals.character_name_modal.exists', { character_name }), ephemeral: true })
						}

						submitted.reply({ content: LanguagesController.content('messages.modals.character_name_modal.success', { character_name }), ephemeral: true })
						return action.character.gender ? collector.emit('update_embed_creation', i) : null
					}
				})

			}

			i.deferUpdate().then(async () => {

				if (action.check && (['confirm', 'cancel', 'confirmcreation'].includes(i.customId)) || i.customId.includes('chselect')) return collector.emit('action', i)

				if (action.active) return collector.emit('step', i)

				action.name = i.customId.includes('chselect') ? 'chselect' : i.customId

				collector.emit('update_embed_menu', i)

			})
		})

		collector.on('step', async (i) => {
			if (['next', 'back'].includes(i.customId)) {
				action.step = i.customId === 'next' ? action.step + 1 : action.step - 1
				action.step = action.step < 0 ? 0 : action.step
				action.step = action.step > action.stepMax ? action.stepMax : action.step
				collector.emit('update_embed_creation', i)
			}
		})

		collector.on('action', async (i) => {

			if (i.customId.startsWith('chselect')) {
				Character.selectCharacter(i.customId.replace('chselect', ''))
				characters.selected_character = i.customId.replace('chselect', '')
				collector.emit('update_embed_menu', i)
				return
			}

			if (action.check === 'Create' && i.customId === 'confirm') {
				action.active = true
				if (await ActionController.inAction(i.user.id, 'create_character')) return i.reply({ content: LanguagesController.content('messages.actions.create_character_already'), ephemeral: true })
				ActionController.addAction(i.user.id, { id: 'create_character', duration: 60 * 10 })
				collector.emit('update_embed_creation', i)
				return
			}
			if (i.customId === 'confirmcreation') {
				action.concluded = true
				Character.create(action.character)
				collector.emit('update_embed_creation', i)
				collector.stop()
				return
			}
			if (i.customId === 'cancel') {
				// emit('update_embed_menu', i)
				collector.stop()
				action.reset()
				return
			}

		})

		collector.on('end', async () => {
			ActionController.removeAction(interaction.user.id, ['create_character', 'characters_command'])
			if (action.concluded) return
			disableAllButtons(charactersMsg)
		})

	}
}