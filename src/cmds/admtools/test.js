const { EmbedBuilder } = require('@discordjs/builders')
const BaseCommand = require('../../BaseCommand')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.test.name'),
			description: client.languages.content('commands.test.name'),
			permissions: ['admin.tools.test'],
		})
	}
	async execute(interaction) {

		console.time('test')

		interaction.deferReply()

		interaction.guild.emojis.create({ attachment: 'https://cdn.discordapp.com/attachments/1054551126600581170/1058436731260637184/43ET27lLkW.png', name: Date.now().toString() })
			.then(emoji => {
				const embedTest = new EmbedBuilder()
					.setTitle('Test')
					.setDescription(`${emoji} Testando...`)

				interaction.editReply({ embeds: [embedTest] }).then(() => {
					interaction.guild.emojis.delete(emoji)
					console.timeEnd('test')
				})
			})
			.catch(console.error)

	}
}