const MiddlewareController = require('../controllers/MiddlewareController');

module.exports = {
   
    name: "interactionCreate",
    execute: async(client, interaction) => {

        const Middleware = new MiddlewareController(client, interaction)

        if(interaction.isCommand()) {
            let cmd = client.commands.get(interaction.commandName)
            if(!cmd) return

            const permissions = await Middleware.checkPermissions(cmd.permissions)

            if (!permissions) return interaction.reply({ content: "Você não tem permissão para executar este comando.", ephemeral: true })

            const character = await Middleware.checkCharacter()

            cmd.execute(interaction).catch((err) => {
                console.log(err)
                interaction.reply({ content: "Ocorreu um erro ao executar este comando.", ephemeral: true })
            })

        }

    }

}