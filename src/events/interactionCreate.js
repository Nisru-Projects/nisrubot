module.exports = {
   
    name: "interactionCreate",
    execute: async(client, interaction) => {

        if(interaction.isCommand()) {
            let cmd = client.commands.get(interaction.commandName)
            if(cmd) cmd.execute(client, interaction)
        }

    }

}