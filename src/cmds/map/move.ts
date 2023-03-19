import { CommandInteraction } from 'discord.js'
import type { NisruClient } from '../../Nisru'
import BaseCommand from '../../utils/BaseCommand'

export default class Command extends BaseCommand {
	constructor(client: NisruClient) {
		super(client, {
			type: 'complementary',
			name: 'move',
			permissions: ['user'],
		})
	}
	async execute(interaction: CommandInteraction) {
		// empty
	}
}