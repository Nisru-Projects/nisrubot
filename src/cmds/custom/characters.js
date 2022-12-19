const BaseCommand = require("../../BaseCommand");
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, SelectMenuBuilder } = require("discord.js");
const disableAllButtons = require("../../utils/disableAllButtons");
const CharacterController = require("../../controllers/CharacterController");
const LanguagesController = require("../../controllers/LanguagesController");
const { calculateLevel } = require("../../utils/levelingForms");
const uppercaseFirstLetter = require("../../utils/uppercaseFirstLetter");

const messages = {
	name: "characters",
	description: "Visualize e gerencie seus personagens",
	charactersEmbed: {
		level: "Level {level}",
		title: "Menu de Personagens",
		description: "{?has_character} Selecione um personagem para visualizar seus dados{?has_character}\n{!has_character} Você não possui nenhum personagem{!has_character}",
	},
	charactersButtons: {
		create: "Criar novo personagem",
		select: "Selecionar {character_name}",
		delete: "Excluir {character_name}",
		sell: "Vender {character_name}",
		customize: "Customizar {character_name}",
		confirmCreate: "Confirmar criação",
		cancelCreate: "Cancelar criação",
		confirmSelect: "Confirmar seleção",
		cancelSelect: "Cancelar seleção",
		confirmDelete: "Confirmar exclusão",
		cancelDelete: "Cancelar exclusão",
		confirmSell: "Confirmar venda",
		cancelSell: "Cancelar venda",
	},
	creationCharacterEmbed: {
		title: "Criação de Personagem",
		description: "Escolha um nome para seu personagem",
	},
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

		const { setStrValues } = new LanguagesController(interaction.user.language)

		const Character = new CharacterController(this.client, interaction.user)

		Character.setCharactersCache(characters)

		const charactersFields = characters.characters.map(async (character_id, index) => {
			const character = await Character.getCharacterInfo(character_id, 'characters_geral')
			return {
				name: character.name,
				value: setStrValues(messages.charactersEmbed.level, { level: calculateLevel(character.exp) }),
				inline: true
			}
		})

		const charactersEmbed = {
			color: 0x36393f,
			title: messages.charactersEmbed.title,
			timestamp: new Date().toISOString(),
			fields: charactersFields,
			description: setStrValues(messages.charactersEmbed.description, { has_character: characters.characters.length > 0 })
		}

		const charactersButtons = characters.characters.map(async (character_id, index) => {
			const character = await Character.getCharacterInfo(character_id, 'characters_geral')
			return new ButtonBuilder()
				.setCustomId(`select${index}`)
				.setLabel(setStrValues(messages.charactersButtons.select, { character_name: character.name }))
				.setEmoji('👤')
				.setStyle(ButtonStyle.Secondary)
		})

		const actionsButtons = [
			new ButtonBuilder()
				.setCustomId('create')
				.setLabel(messages.charactersButtons.create)
				.setEmoji('👤')
				.setStyle(ButtonStyle.Primary),
		]

		if (characters.selected) {
			actionsButtons.push(
				new ButtonBuilder()
					.setCustomId('customize')
					.setLabel(setStrValues(messages.charactersButtons.customize, { character_name: characters.selected.name }))
					.setEmoji('1054051525204385882')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel(setStrValues(messages.charactersButtons.delete, { character_name: characters.selected.name }))
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('sell')
					.setLabel(setStrValues(messages.charactersButtons.sell, { character_name: characters.selected.name }))
					.setStyle(ButtonStyle.Success)
			)
		}

		const checkButtons = (type) => {
			console.log(type)
			return [
				new ButtonBuilder()
					.setCustomId('confirm')
					.setLabel(messages.charactersButtons[`confirm${type}`])
					.setEmoji('✅')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('cancel')
					.setLabel(messages.charactersButtons[`cancel${type}`])
					.setEmoji('❌')
					.setStyle(ButtonStyle.Danger),
			]
		}

		const creationCharacter = async () => {
			const creationEmbed = {
				color: 0x36393f,
				title: messages.creationCharacterEmbed.title,
				timestamp: new Date().toISOString(),
				description: messages.creationCharacterEmbed.description
			}
			const creationComponents = () => {
				
			}

			return { creationEmbed, creationComponents }
		}

		const charactersComponents = []
		
		if (charactersButtons.length > 0) charactersComponents.push(new ActionRowBuilder().addComponents(charactersButtons))
		charactersComponents.push(new ActionRowBuilder().addComponents(actionsButtons))
		
		const charactersMsg = await interaction.reply({ embeds: [charactersEmbed], components: charactersComponents, fetchReply: true })
		
		const filter = (interaction) => interaction.user.id === interaction.user.id
		
		const collector = charactersMsg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 15000 })
		
		var checkAction
		
		var action = {
			name: '',
			step: 0
		}
		
		collector.on('collect', async (i) => {
			i.deferUpdate().then(async () => {
				collector.resetTimer()
				
				if (!checkAction && !['confirm', 'cancel'].includes(i.customId) && !i.customId.includes('select')) {
					checkAction = uppercaseFirstLetter(i.customId)
					charactersComponents.push(new ActionRowBuilder().addComponents(checkButtons(checkAction)))
					charactersComponents.forEach((row) => {
						row.components.forEach((button) => {
							if (button.data.custom_id === i.customId) button.data.disabled = true
						})
					})
					return charactersMsg.edit({ components: charactersComponents })
				}
				else checkAction = undefined

				action.name = i.customId.includes('select') ? 'select' : i.customId
				
				if (i.customId === 'create') {
					const { creationEmbed, creationComponents } = await creationCharacter(action)
					charactersMsg.edit({ embeds: [creationEmbed], components: creationComponents })
					//start create character
				}
				if (i.customId === 'customize') {
					//start customize character
				}
				if (i.customId === 'delete') {
					//start delete character
				}
				if (i.customId === 'sell') {
					//start sell character
				}
				if (i.customId.includes('select')) {
					//start select character
				}
			})
		})

		collector.on('end', async (collected) => {
			disableAllButtons(charactersMsg)
		})

	}
}
