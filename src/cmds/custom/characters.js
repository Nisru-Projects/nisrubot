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
		confirmCreate: "Criar personagem",
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
	creationCharacterButtons: {
		confirm: "Confirmar personagem",
		cancel: "Cancelar criação",
		next: "Próximo",
		back: "Voltar",
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

		const Languages = new LanguagesController(interaction.user.language)

		const Character = new CharacterController(this.client, interaction.user)

		Character.setCharactersCache(characters)

		const charactersFields = characters.characters.map(async (character_id, index) => {
			const character = await Character.getCharacterInfo(character_id, 'characters_geral')
			return {
				name: character.name,
				value: Languages.setStrValues(messages.charactersEmbed.level, { level: calculateLevel(character.exp) }),
				inline: true
			}
		})

		const charactersEmbed = {
			color: 0x36393f,
			title: messages.charactersEmbed.title,
			timestamp: new Date().toISOString(),
			fields: charactersFields,
			description: Languages.setStrValues(messages.charactersEmbed.description, { has_character: characters.characters.length > 0 })
		}

		const charactersButtons = characters.characters.map(async (character_id, index) => {
			const character = await Character.getCharacterInfo(character_id, 'characters_geral')
			return new ButtonBuilder()
				.setCustomId(`select${index}`)
				.setLabel(Languages.setStrValues(messages.charactersButtons.select, { character_name: character.name }))
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
					.setLabel(Languages.setStrValues(messages.charactersButtons.customize, { character_name: characters.selected.name }))
					.setEmoji('1054051525204385882')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel(Languages.setStrValues(messages.charactersButtons.delete, { character_name: characters.selected.name }))
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('sell')
					.setLabel(Languages.setStrValues(messages.charactersButtons.sell, { character_name: characters.selected.name }))
					.setStyle(ButtonStyle.Success)
			)
		}

		const checkButtons = (type) => {
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

		const charactersComponents = []
		
		if (charactersButtons.length > 0) charactersComponents.push(new ActionRowBuilder().addComponents(charactersButtons))
		charactersComponents.push(new ActionRowBuilder().addComponents(actionsButtons))
		
		const charactersMsg = await interaction.reply({ embeds: [charactersEmbed], components: charactersComponents, fetchReply: true })
		
		const filter = (interaction) => interaction.user.id === interaction.user.id
		
		const collector = charactersMsg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 15000 })
		
		var action = {
			name: '',
			step: 0
		}
		
		collector.on('collect', async (i) => {
			i.deferUpdate().then(async () => {
				collector.resetTimer()

				if (action.check && ['confirm', 'cancel'].includes(i.customId)) {
					collector.emit('action', i)
					return
				}
				
				if (!action.check && !['confirm', 'cancel'].includes(i.customId) && !i.customId.includes('select')) {
					action.check = uppercaseFirstLetter(i.customId)
					charactersComponents.push(new ActionRowBuilder().addComponents(checkButtons(action.check)))
					charactersComponents.forEach((row) => {
						row.components.forEach((button) => {
							if (button.data.custom_id === i.customId) button.data.disabled = true
						})
					})
					return charactersMsg.edit({ components: charactersComponents })
				}

				action.name = i.customId.includes('select') ? 'select' : i.customId


			})
		})

		collector.on('action', async (i) => {

			if (action.check === 'Create' && i.customId === 'confirm') {

				const creationCharacter = async () => {
					const creationEmbed = {
						color: 0x36393f,
						title: messages.creationCharacterEmbed.title,
						timestamp: new Date().toISOString(),
						description: messages.creationCharacterEmbed.description
					}
					const creationComponents = () => {
						return [
							new ActionRowBuilder().addComponents([
								new ButtonBuilder()
									.setCustomId('back')
									.setLabel(messages.creationCharacterButtons.back)
									.setEmoji('⬅️')
									.setStyle(ButtonStyle.Primary)
									.setDisabled(true),
								new ButtonBuilder()
									.setCustomId('next')
									.setLabel(messages.creationCharacterButtons.next)
									.setEmoji('➡️')
									.setStyle(ButtonStyle.Primary),
								new ButtonBuilder()
									.setCustomId('confirmcreation')
									.setLabel(messages.creationCharacterButtons.confirm)
									.setEmoji('✅')
									.setStyle(ButtonStyle.Success)
									.setDisabled(true),
								new ButtonBuilder()
									.setCustomId('cancel')
									.setLabel(messages.creationCharacterButtons.cancel)
									.setEmoji('❌')
									.setStyle(ButtonStyle.Danger)
							])
						]
					}
		
					return { creationEmbed, creationComponents }
				}

				const { creationEmbed, creationComponents } = await creationCharacter()
				charactersMsg.edit({ embeds: [creationEmbed], components: creationComponents() })
				action.step = 1
			} else if (action.check === 'Create' && i.customId === 'cancel') {
				collector.stop()
			}

		})

		collector.on('end', async (collected) => {
			disableAllButtons(charactersMsg)
		})

	}
}
