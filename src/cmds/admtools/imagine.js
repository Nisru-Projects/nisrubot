const { default: axios } = require("axios");
const { ApplicationCommandOptionType, AttachmentBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const BaseCommand = require("../../BaseCommand");

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.imagine.name'),
			description: client.languages.content('commands.imagine.name'),
			permissions: ['user'],
            options: [
                {
                    name: 'prompt',
                    description: 'Prompt',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'options',
                    description: 'Options',
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
		});
	}
	async execute(interaction) {

        await interaction.deferReply()

        const opt = interaction.options.getString('options') ?? "medieval style, digital art, hd"

        axios.post('https://api.openai.com/v1/images/generations', {
            prompt: `${interaction.options.getString('prompt')}, ${opt}`
        }, {
            headers: {
                'Authorization': `Bearer ${this.client.config.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }).then(res => {
            const files = res.data.data.map((img, i) => new AttachmentBuilder(img.url).setName(`image-${i}.png`))

            const buttons = new ActionRowBuilder()

            buttons.addComponents(res.data.data.map((img, i) => new ButtonBuilder().setURL(img.url).setLabel(`Image ${i}`).setStyle('Link')))

            const date = new Date(res.data.created * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

            const imagine = { content: `${date} ${interaction.options.getString('prompt')} ${opt}`, files, components: [buttons] }

            interaction.editReply(imagine)

            this.client.channels.cache.get('1054551126600581170').send(imagine)

        }).catch(err => {
            interaction.editReply({ content: err.message })
        })

        return 

	}
}