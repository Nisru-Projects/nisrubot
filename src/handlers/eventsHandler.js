const { readdir } = require('fs');

module.exports = (client) => {
    readdir("./src/events/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            let eventFunction = require(`../events/${file}`);
            const execute = (...args) => eventFunction.execute(client, ...args)
            if (eventFunction.once) {
                client.once(eventFunction.name, execute);
                return;
            }
            client.on(eventFunction.name, execute);
        });
        console.log(`[EVENTS] Loaded ${files.length} events`.green )
    });
}