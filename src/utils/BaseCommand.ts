import { ApplicationCommandOption, Options } from "discord.js"
import NisruClient from "../Nisru"
import { NisruCommand } from "../types/commands"
import { UserPermission } from "../types/database/users"

export default class BaseCommand {
	client: NisruClient
	name: string | null
	description: string
	permissions: UserPermission[]
	type: string
	options: ApplicationCommandOption[] | undefined
	constructor(client: NisruClient, options: NisruCommand) {
		this.client = client,
		this.name = options.name || null,
		this.description = options.description || 'No description.',
		this.options = options.options || undefined,
		this.permissions = options.permissions || []
		this.type = options.type || 'slash'
	}
}