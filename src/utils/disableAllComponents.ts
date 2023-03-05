import { Message } from "discord.js"

export default function disableAllComponents (message: Message) {
	message.components.forEach((row: { components: any[] }) => {
		row.components.forEach((component: { data: { disabled: boolean } }) => {
			component.data.disabled = true
		})
	})
	message.edit({ components: message.components })
}