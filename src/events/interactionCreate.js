const MiddlewareController = require('../controllers/MiddlewareController');

const messages = {
    "noPermission": "Você não tem permissão para executar este comando.",
    "noCharacter": "Você não possui um personagem criado atualmente, digite /personagem para criar um personagem.",
    "noSelectedCharacter": "Você não possui um personagem selecionado atualmente, digite /personagem para selecionar um personagem.",
    "errorCommand": "Ocorreu um erro ao executar este comando."
}

module.exports = {
    name: "interactionCreate",
    execute: async(client, interaction) => {

        const Middleware = new MiddlewareController(client, interaction)

        if(interaction.isCommand()) {
            let cmd = client.commands.get(interaction.commandName)
            if(!cmd) return

            await Middleware.checkUser()

            const permissions = await Middleware.checkPermissions(cmd.permissions)

            if (!permissions) return interaction.reply({ content: messages.noPermission, ephemeral: true })

            const character = await Middleware.getCharacters()

            if (!['users', 'admtools'].includes(cmd.category) && cmd.fileName != 'characters.js') {
                if (character.characters.length == 0) return interaction.reply({ content: messages.noCharacter, ephemeral: true })
                if (!character.selected_character) return interaction.reply({ content: messages.noSelectedCharacter, ephemeral: true })
            }

            cmd.execute(interaction, character).then(() => {
            }).catch((err) => {
                console.log(err)
                interaction.reply({ content: messages.errorCommand, ephemeral: true })
            })

        }

    }
}