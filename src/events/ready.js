module.exports = {
   
    name: "ready",
    once: true,
    execute: async(client) => {

        //client.application.commands.set([]);
        
        const commands = client.commands.map(cmd => { 
            return {
                name: cmd.name,
                description: cmd.description ?? "Sem descrição",
                options: cmd.options
            }
        })
        
        client.guilds.cache.forEach(guild => {
            // checar se já tem os comandos
            guild.commands.set(commands)
        })

        console.log(`\n         Bot started.\n`.green);

    }

}