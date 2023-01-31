const { readdirSync } = require('fs')

module.exports = (client) => {
	const files = readdirSync('./src/events/')
	const time = Date.now()
	files.forEach(file => {
		const eventFunction = require(`../events/${file}`)
		const execute = (...args) => eventFunction.execute(client, ...args)
		if (eventFunction.once) {
			return client.once(eventFunction.name, execute)
		}
		client.on(eventFunction.name, execute)
	})
	console.log(`[EVENTS] Loaded ${files.length} events in ${(Date.now() - time) / 1000}s`.green)
}