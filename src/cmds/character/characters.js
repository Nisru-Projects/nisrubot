const BaseCommand = require('../../utils/BaseCommand')
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const disableAllComponents = require('../../utils/disableAllComponents')
const CharacterController = require('../../controllers/CharacterController')
const ActionsController = require('../../controllers/ActionsController')
const { calculateLevel, percentageToNextLevel } = require('../../utils/levelingForms')
const uppercaseFirstLetter = require('../../utils/uppercaseFirstLetter')
const randomString = require('../../utils/randomString')
const asciiProgressbar = require('../../utils/asciiProgressbar')

const elements = [
	{ name: 'fire', value: 'fire', emoji: '🔥', description: 'Fire', canSelect: true },
	{ name: 'water', value: 'water', emoji: '💧', description: 'Water', canSelect: true },
	{ name: 'earth', value: 'earth', emoji: '🌎', description: 'Earth', canSelect: true },
	{ name: 'air', value: 'air', emoji: '💨', description: 'Air', canSelect: true },
	{ name: 'light', value: 'light', emoji: '🌞', description: 'Light', canSelect: true },
	{ name: 'dark', value: 'dark', emoji: '🌑', description: 'Dark', canSelect: true },
]

const constellations = [
	{ name: 'aquarius', value: 'aquarius', emoji: '♒', description: 'Aquarius', canSelect: true, blessings: ['water', 'air'] },
	{ name: 'aries', value: 'aries', emoji: '♈', description: 'Aries', canSelect: true, blessings: ['fire', 'air'] },
	{ name: 'cancer', value: 'cancer', emoji: '♋', description: 'Cancer', canSelect: true, blessings: ['water', 'earth'] },
	{ name: 'capricorn', value: 'capricorn', emoji: '♑', description: 'Capricorn', canSelect: true, blessings: ['earth', 'fire'] },
	{ name: 'gemini', value: 'gemini', emoji: '♊', description: 'Gemini', canSelect: true, blessings: ['air', 'light'] },
	{ name: 'leo', value: 'leo', emoji: '♌', description: 'Leo', canSelect: true, blessings: ['fire', 'light'] },
	{ name: 'libra', value: 'libra', emoji: '♎', description: 'Libra', canSelect: true, blessings: ['air', 'dark'] },
	{ name: 'pisces', value: 'pisces', emoji: '♓', description: 'Pisces', canSelect: true, blessings: ['water', 'dark'] },
	{ name: 'sagittarius', value: 'sagittarius', emoji: '♐', description: 'Sagittarius', canSelect: true, blessings: ['earth', 'air'] },
	{ name: 'scorpio', value: 'scorpio', emoji: '♏', description: 'Scorpio', canSelect: true, blessings: ['water', 'fire'] },
	{ name: 'taurus', value: 'taurus', emoji: '♉', description: 'Taurus', canSelect: true, blessings: ['earth', 'water'] },
	{ name: 'virgo', value: 'virgo', emoji: '♍', description: 'Virgo', canSelect: true, blessings: ['earth', 'dark'] },
]

const races = [
	{
		name: 'human',
		value: 'human',
		emoji: '👨',
		description: 'Human',
		canSelect: true,
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
		canSelect: true,
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
		canSelect: true,
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
		canSelect: true,
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
		canSelect: true,
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
			name: 'characters',
			permissions: ['user'],
		})
	}
	async execute(interaction, characters) {

		const ActionController = new ActionsController(this.client.redisCache)

		if (await ActionController.inAction(interaction.user.id, 'characters_command')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.characters_command_already'), ephemeral: true })
		}

		if (await ActionController.inAction(interaction.user.id, 'use_character')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.use_character_already'), ephemeral: true })
		}

		const command_handler = randomString(16)

		await ActionController.addAction(interaction.user.id, { id: 'characters_command', duration: 60 * 12, handler: command_handler })
		await ActionController.addAction(interaction.user.id, { id: 'use_character', handler: command_handler, type: 'characters' })

		const LanguagesController = this.client.languages

		const characterController = new CharacterController(this.client, interaction.user)

		const action = {
			possiblesConstellations: constellations.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * (5 - 2 + 1) + 2)),
			reset: () => {
				action.active = false
				action.step = 0
				action.stepMax = 2
				action.character = {
					user_id: interaction.user.id,
				}
			},
		}

		action.reset()

		const checkButton = (charactersComponents, buttonCustomId) => {
			charactersComponents.forEach((row) => {
				row.components.forEach((button) => {
					if (button.data.custom_id === buttonCustomId) {
						button.data.label = LanguagesController.content('messages.characters.creationCharacterDefaults.confirm', { option: '{%messages.characters.creationCharacterDefaults.createOption}' })
						button.data.custom_id = 'confirm'
						button.data.emoji = { name: '✅' }
						button.data.style = ButtonStyle.Success
					}
				})
			})
		}

		async function menuEmbed(i) {

			async function getCharactersComponents() {

				const charactersFields = []

				const selectionMenu = new StringSelectMenuBuilder()
					.setCustomId('chselectionmenu')
					.setPlaceholder(LanguagesController.content('messages.characters.charactersMenus.nocharacters'))

				const actionMenu = new StringSelectMenuBuilder()
					.setCustomId('chactionmenu')
					.setPlaceholder(LanguagesController.content('messages.characters.charactersMenus.actioncharacter'))

				for (const character_id of characters.characters) {
					const character = (await characterController.getCharacterInfo(character_id, 'characters_geral'))['characters_geral.*']
					const characterInfos = []
					const progressbar = asciiProgressbar({ percent: percentageToNextLevel(character.exp), size: 10 })
					characterInfos.push(LanguagesController.content('messages.characters.currentLevelProgress', { progressbar, currentlevel: calculateLevel(character.exp), nextlevel: calculateLevel(character.exp) + 1 }))
					charactersFields.push({ name: character.essence.name, value: characterInfos.join('\n') })
					selectionMenu.addOptions({
						value: character.character_id,
						label: character.essence.name,
						description: LanguagesController.content('messages.characters.charactersMenus.select', { character_name: character.essence.name }),
						emoji: '👤',
						default: character.character_id === characters.selected_character,
					})
				}

				if (characters.selected_character) {
					const selected_character = (await characterController.getCharacterInfo(characters.selected_character, 'characters_geral'))['characters_geral.*']

					actionMenu.setOptions([{
						value: 'customize',
						label: LanguagesController.content('messages.characters.charactersMenus.customize', { character_name: selected_character.essence.name }),
						description: LanguagesController.content('messages.characters.charactersMenus.customize', { character_name: selected_character.essence.name }),
						emoji: '1054051525204385882',
					},
					{
						value: 'delete',
						label: LanguagesController.content('messages.characters.charactersMenus.delete', { character_name: selected_character.essence.name }),
						description: LanguagesController.content('messages.characters.charactersMenus.delete', { character_name: selected_character.essence.name }),
						emoji: '❌',
					},
					{
						value: 'sell',
						label: LanguagesController.content('messages.characters.charactersMenus.sell', { character_name: selected_character.essence.name }),
						description: LanguagesController.content('messages.characters.charactersMenus.sell', { character_name: selected_character.essence.name }),
						emoji: '💰',
					},
					{
						value: 'visualize',
						label: LanguagesController.content('messages.characters.charactersMenus.visualize', { character_name: selected_character.essence.name }),
						description: LanguagesController.content('messages.characters.charactersMenus.visualize', { character_name: selected_character.essence.name }),
						emoji: '👁️',
					},
					])
				}

				return { charactersFields, selectionMenu, actionMenu }

			}

			const { charactersFields, selectionMenu, actionMenu } = await getCharactersComponents()

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
					.setLabel(LanguagesController.content('messages.characters.charactersMenus.create'))
					.setEmoji('👤')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(await ActionController.inAction(interaction.user.id, 'create_character')),
				new ButtonBuilder()
					.setCustomId('cancel')
					.setLabel(LanguagesController.content('verbs.close'))
					.setEmoji('❌')
					.setStyle(ButtonStyle.Danger),
			]

			const charactersComponents = []

			charactersComponents.push(new ActionRowBuilder().addComponents([...actionsButtons]))
			charactersComponents.push(new ActionRowBuilder().addComponents(selectionMenu))
			if (characters.selected_character) charactersComponents.push(new ActionRowBuilder().addComponents(actionMenu))

			if (i && !['confirm', 'cancel', 'confirmcreation'].includes(i.customId) && !i.customId.includes('chselect')) {
				action.check = uppercaseFirstLetter(i.customId)
				checkButton(charactersComponents, i.customId)
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
			return ActionController.removeAction(interaction.user.id, ['characters_command', 'use_character'])
		}

		const filter = (i) => i.user.id === interaction.user.id

		const collector = charactersMsg.createMessageComponentCollector({ filter, time: 1000 * 60 * 5 })

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

			creationEmbed.fields.push({ name: `${LanguagesController.content('nouns.name')}: ${action.character.name || LanguagesController.content('nouns.undefined')}`,
				value: `
${LanguagesController.content('nouns.gender')}: ${LanguagesController.content(`genders.${action.character.gender}`, { undefined: 'nouns.undefined' })}
${LanguagesController.content('nouns.race')}: ${LanguagesController.content(`races.${action.character.race}`, { undefined: 'nouns.undefined' })}
${LanguagesController.content('nouns.element')}: ${action.character.element}
${LanguagesController.content('nouns.constellation')}: ${action.character.constellation}` })
			if (action.character.baseAttributes) creationEmbed.fields.push({ name: LanguagesController.content('nouns.attributes'), value: Object.entries(action.character.baseAttributes).map((attribute) => `${attribute[0]}: ${attribute[1]}`).join('\n') })

			if (action.character.gamemode) creationEmbed.fields.push({ name: `${LanguagesController.content('nouns.gamemode')}: ${LanguagesController.content(`nouns.${action.character.gamemode}`, { undefined: 'nouns.undefined' })}`, value: LanguagesController.content(`messages.characters.creationCharacterDefaults.gamemode.${action.character.gamemode}`) })

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
							.setLabel(LanguagesController.content('messages.characters.creationCharacterDefaults.setname', { character_name: action.character.name ?? '' }))
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
							.addOptions(races.filter(race => race.canSelect).map((race) => {
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
							.addOptions(elements.filter(element => element.canSelect).map((element) => {
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

				if (i.customId.startsWith('chactionmenu')) {
					const value = i.values[0]
					collector.resetTimer()
					if (value == 'customize') {
						await ActionController.removeAction(interaction.user.id, ['create_character', 'characters_command', 'use_character'])
						collector.stop()
						return this.client.commands.get(this.client.languages.content('commands.customcharacter.name'))?.execute(i, characters)
					}
					if (value == 'visualize') {
						await ActionController.removeAction(interaction.user.id, ['create_character', 'characters_command', 'use_character'])
						collector.stop()
						return this.client.commands.get(this.client.languages.content('commands.viewcharacter.name'))?.execute(i, characters)
					}
					if (value == 'delete') {
						characterController.deleteCharacter(action.character.id)
					}
				}

				i.deferUpdate().then(async () => {
					if ([...Object.keys(action.character), 'selectgamemode'].includes(i.customId)) {
						action.character[i.customId.replace('select', '')] = i.values[0]
						if (['selectrace'].includes(i.customId)) {
							action.character.baseAttributes = races.find((race) => race.value == action.character.race)?.baseAttributes
						}
						if (!validateCharacter().step.includes(undefined) || (i.customId == 'selectgender' && action.character.name)) {
							collector.emit('update_embed_creation', i)
						}
					}
					if (i.customId == 'chselectionmenu') {
						const characterid = i.values[0]
						characterController.selectCharacter(characterid)
						characters.selected_character = characterid
						return
					}

					if (i.customid == 'selectcustom') {
						action.custom = i.values[0]
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

				if (i.customId === 'cancel') return collector.stop()

				if (action.check && (['confirm', 'cancel', 'confirmcreation'].includes(i.customId)) || i.customId.includes('chselect')) return collector.emit('action', i)

				if (action.active) return collector.emit('stepCreation', i)

				collector.emit('update_embed_menu', i)

			})
		})

		collector.on('stepCreation', async (i) => {
			if (['next', 'back'].includes(i.customId)) {
				action.step = i.customId === 'next' ? action.step + 1 : action.step - 1
				action.step = action.step < 0 ? 0 : action.step
				action.step = action.step > action.stepMax ? action.stepMax : action.step
				collector.emit('update_embed_creation', i)
			}
		})

		collector.on('action', async (i) => {

			if (action.check === 'Create' && i.customId === 'confirm') {
				action.active = true
				if (await ActionController.inAction(i.user.id, 'create_character')) return i.reply({ content: LanguagesController.content('messages.actions.create_character_already'), ephemeral: true })
				ActionController.addAction(i.user.id, { id: 'create_character', duration: 60 * 10 })
				collector.emit('update_embed_creation', i)
				return
			}
			if (i.customId === 'confirmcreation') {
				action.concluded = true
				characterController.create(action.character)
				collector.emit('update_embed_creation', i)
				collector.stop()
				return
			}

		})

		collector.on('end', async () => {
			ActionController.removeAction(interaction.user.id, ['create_character', 'characters_command', 'use_character'])
			if (action.concluded) return
			const newCharactersMsg = await interaction.channel.messages.fetch(charactersMsg.id)

			disableAllComponents(newCharactersMsg)
		})

	}

}