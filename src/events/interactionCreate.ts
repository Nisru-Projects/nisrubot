import { CommandInteraction } from 'discord.js'
import type { NisruClient } from '../Nisru'

import MiddlewareController from '../controllers/MiddlewareController'

const messages = {
	'noPermission': 'Você não tem permissão para executar este comando.',
	'noCharacter': 'Você não possui um personagem criado atualmente, digite /personagem para criar um personagem.',
	'noSelectedCharacter': 'Você não possui um personagem selecionado atualmente, digite /personagem para selecionar um personagem.',
	'errorCommand': 'Ocorreu um erro ao executar este comando.',
}

export default {
	name: 'interactionCreate',
	execute: async (client: NisruClient, interaction: CommandInteraction) => {

		const Middleware = new MiddlewareController(client, interaction)

		if (!Middleware.isReadyToPlay()) return interaction.reply({ content: 'The bot is not ready to play, please wait a few seconds.', ephemeral: true })

		if (interaction.isCommand()) {

			const commandName = client.languages.getCommandKey(interaction.commandName)

			const cmd = client.commands?.get(commandName)
			if (!cmd) return

			await Middleware.checkUser()

			const permissions = await Middleware.checkPermissions(cmd.permissions)

			if (!permissions) return interaction.reply({ content: messages.noPermission, ephemeral: true })

			const character = await Middleware.getCharacters()

			if (!['users', 'admtools'].includes(cmd.category as any) && cmd.fileName != 'characters.js') {
				if (character.characters.length == 0) return interaction.reply({ content: messages.noCharacter, ephemeral: true })
				if (!character.selected_character) return interaction.reply({ content: messages.noSelectedCharacter, ephemeral: true })
			}

			cmd.execute!(interaction, character).then(() => {
				client.dataManager.globalData.increment('totalcommands', 1)
			}).catch((err) => {
				console.log(err)
				interaction.reply({ content: messages.errorCommand, ephemeral: true })
			})

		}

	},
}