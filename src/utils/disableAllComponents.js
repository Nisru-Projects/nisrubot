module.exports = (message) => {
	message.components.forEach(row => {
		row.components.forEach(component => {
			component.data.disabled = true
		})
	})
	message.edit({ components: message.components })
}