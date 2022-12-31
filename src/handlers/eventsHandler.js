const { readdirSync } = require('fs')

module.exports = (client) => {
	const files = readdirSync('./src/events/')
	files.forEach(file => {
		const eventFunction = require(`../events/${file}`)
		const execute = (...args) => eventFunction.execute(client, ...args)
		if (eventFunction.once) {
			client.once(eventFunction.name, execute)
			return
		}
		client.on(eventFunction.name, execute)
	})
	console.log(`[EVENTS] Loaded ${files.length} events`.green)
}