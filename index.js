const {Client, ButtonBuilder, ComponentType, ButtonStyle, IntentsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags, TextDisplayComponent} = require('discord.js');
require('dotenv').config();
const text = require('./text.json');
const {appendFile} = require('fs/promises');

const prefix = text.idprefix;
const Cli = new Client({
  intents: 0,
});


Cli.login(process.env.TOKEN)

Cli.on('clientReady', ready);

Cli.on('interactionCreate', handleInteraction);

async function ready() {
  console.log(`${Cli.user.tag} Online!`)
  if (!process.env.INIT) {
    try {
      await initInteraction()
    } catch (e) {
      console.error(e)
      console.error('[FATAL] Failed to initiate Interaction!')
    }
  }
  else {
    // TBD
  }
}

async function initInteraction() {
  // const guild = process.env.GUILD_ID;
  const channel = process.env.CHANNEL_ID;
  const chn = await Cli.channels.fetch(channel);
  if (!chn) console.error(`[FATAL] Failed to fetch channel (ID: ${channel})!`)
  const row = new ActionRowBuilder();
  for (let info of text.form) {
    const [cat, name] = [info.category, info.label];
    const btn = new ButtonBuilder();
    btn.setCustomId(`${prefix}_0_${cat}`);
    btn.setLabel(name);
    btn.setStyle(ButtonStyle.Primary);
    row.addComponents(btn);
  }
  
  const msg = text.msg;
  if(msg.components) msg.components.push(row)
  else msg.components = [row]
  await chn.send(msg);
  await appendFile('.env', '\n\nINIT=1')
  console.log('[INFO] Boutons créés!')
}

/**
 * 
 * @param {import('discord.js').Interaction} interaction 
 */
async function handleInteraction(interaction) {
  const fieldsNo = text.form.questions.length;
  const response = [];
  if (interaction.customId === `${prefix}_1`) {
    for (let i = 1; i <= fieldsNo; i++) response.push(interaction.fields.getTextInputValue(`Q${i}`))
    console.log(response);
     // Fetch Apps Script endpoint
    await interaction.reply({
      content: 'Reçu!',
      flags: MessageFlags.Ephemeral,
    });
  }
  if (!interaction.customId.startsWith(`${prefix}_0`)) {
    return
  }
  const type = interaction.customId.split('_')[2];
  const info = text.form.find(el=>el.category === type)
  const modal = new ModalBuilder()
			.setCustomId(`${prefix}_1`)
			.setTitle(info.title);

	let id = 1
  const rows = []
  for (const question of info.questions) {
    const input = new TextInputBuilder();
    input.setCustomId(`Q${id}`)
    input.setLabel(question.question)
    input.setStyle(TextInputStyle[question.style])
    input.setPlaceholder(question.placeholder)
    rows.push(new ActionRowBuilder().addComponents(input))
    id ++
  }
		modal.addComponents(...rows);
		await interaction.showModal(modal);
}