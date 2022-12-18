const MiddlewareController = require('../controllers/MiddlewareController');

const messages = {
    "noPermission": "Você não tem permissão para executar este comando.",
    "noCharacter": "Você não possui um personagem criado atualmente, digite /personagem para criar um personagem.",
    "errorCommand": "Ocorreu um erro ao executar este comando."
}

module.exports = {
   
    name: "interactionCreate",
    execute: async(client, interaction) => {

        const Middleware = new MiddlewareController(client, interaction)

        if(interaction.isCommand()) {
            let cmd = client.commands.get(interaction.commandName)
            if(!cmd) return

            const permissions = await Middleware.checkPermissions(cmd.permissions)

            if (!permissions) return interaction.reply({ content: messages.noPermission, ephemeral: true })

            const character = await Middleware.getCharacter()

            if (!character) return interaction.reply({ content: messages.noCharacter, ephemeral: true })

            cmd.execute(interaction).catch((err) => {
                console.log(err)
                interaction.reply({ content: messages.errorCommand, ephemeral: true })
            })

        }

    }

}