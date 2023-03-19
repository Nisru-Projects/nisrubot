import { CommandInteraction } from 'discord.js'
import type { NisruClient } from '../../Nisru'

import BaseCommand from '../../utils/BaseCommand'

export default class Command extends BaseCommand {
	constructor(client: NisruClient) {
		super(client, {
			name: 'ping',
			permissions: ['user'],
		})
	}
	async execute(interaction: CommandInteraction) {
		const client = this.client
		function ping(letping: number | string) {
			return client.languages.content('messages.ping.ping', { ping: letping, api: client.ws.ping })
		}
		const msg = await interaction.reply({ fetchReply: true, content: ping('{%messages.ping.calculating') })
		msg.edit({ content: ping(msg.createdTimestamp - interaction.createdTimestamp) })
	}
}