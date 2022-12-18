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
            guild.commands.set(commands)
        })

        console.log(`\n         Bot started.\n`.green);

    }

}