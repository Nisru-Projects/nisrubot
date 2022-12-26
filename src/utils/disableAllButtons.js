module.exports = (message) => {
	message.components.forEach(row => {
		row.components.forEach(button => {
			button.data.disabled = true
		})
	})
	message.edit({ components: message.components })
}