const BaseCommand = require('../../utils/BaseCommand')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			type: 'complementary',
			name: 'move',
			permissions: ['user'],
		})
	}
	async execute(interaction) {
		// empty
	}
}