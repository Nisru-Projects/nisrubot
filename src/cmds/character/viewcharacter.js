const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const ActionsController = require('../../controllers/ActionsController')
const CharacterController = require('../../controllers/CharacterController')
const asciiProgressbar = require('../../utils/asciiProgressbar')
const BaseCommand = require('../../utils/BaseCommand')
const { percentageToNextLevel, calculateLevel } = require('../../utils/levelingForms')
const randomString = require('../../utils/randomString')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.viewcharacter.name'),
			description: client.languages.content('commands.viewcharacter.name'),
			permissions: ['user'],
		})
	}
	async execute(interaction) {

		const characterController = new CharacterController(this.client, interaction.user)

		const LanguagesController = this.client.languages

		const selectedCharacterId = await characterController.getSelectedCharacterId()

		const characterInfo = (await characterController.getCharacterInfo(selectedCharacterId, 'characters_geral'))['characters_geral.*']

		const characterSkin = await characterController.getSkin(selectedCharacterId)

		const ActionController = new ActionsController(this.client.redisCache)

		if (await ActionController.inAction(interaction.user.id, 'viewcharacter_command')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.viewcharacter_command_already'), ephemeral: true })
		}

		if (await ActionController.inAction(interaction.user.id, 'use_character')) {
			return interaction.reply({ content: this.client.languages.content('messages.actions.use_character_already'), ephemeral: true })
		}

		const command_handler = randomString(16)

		await ActionController.addAction(interaction.user.id, { id: 'viewcharacter_command', duration: 60 * 12, handler: command_handler })
		await ActionController.addAction(interaction.user.id, { id: 'use_character', handler: command_handler, type: 'viewcharacter' })

		async function getCharacterInfoMessage() {
			const characterInfoEmbed = new EmbedBuilder()

			const attributesArrayMap = Object.entries(characterInfo.attributes).map(([key, value]) => {
				return `${key}: ${value}`
			})

			const levelProgressbar = asciiProgressbar({ percent: percentageToNextLevel(characterInfo.exp), size: 10 })

			const levelInfo = LanguagesController.content('messages.characters.currentLevelProgress', { progressbar: levelProgressbar, currentlevel: calculateLevel(characterInfo.exp), nextlevel: calculateLevel(characterInfo.exp) + 1 })

			const raceInfo = `${LanguagesController.content('nouns.race')}: \`${LanguagesController.content(`races.${characterInfo.essence.race}`)}\``

			const elementInfo = `${LanguagesController.content('nouns.element')}: \`${LanguagesController.content(`elements.${characterInfo.essence.element}`, { undefined: 'nouns.undefined' })}\``

			const constellationInfo = `${LanguagesController.content('nouns.constellation')}: \`${LanguagesController.content(`constellations.${characterInfo.essence.constellation}`, { undefined: 'nouns.undefined' })}\``

			const genderIcon = (gender) => {
				switch (gender) {
				case 'male':
					return '♂️'
				case 'female':
					return '♀️'
				default:
					return '❓'
				}
			}

			const genderInfo = `${LanguagesController.content('nouns.gender')}: ${LanguagesController.content(`genders.${characterInfo.essence.gender}`)} \`${genderIcon(characterInfo.essence.gender)}\``

			const skinAttachment = new AttachmentBuilder(Buffer.from(characterSkin.buffer), { name: 'skin.png' })

			characterInfoEmbed.setAuthor({ name: `${characterInfo.essence.name}`, iconURL: 'attachment://skin.png' })

			characterInfoEmbed.setDescription(`${levelInfo}\n${genderInfo}\n${raceInfo}\n${elementInfo}\n${constellationInfo}`)

			characterInfoEmbed.addFields({ name: LanguagesController.content('nouns.attributes'), value: attributesArrayMap.join('\n') })

			console.log(characterInfo)

			const characterInfoComponents = []
			return { embeds: [characterInfoEmbed], components: characterInfoComponents, files: [skinAttachment] }
		}

		interaction.reply(await getCharacterInfoMessage())

		ActionController.removeAction(interaction.user.id, ['viewcharacter_command', 'use_character'])

		return
	}
}