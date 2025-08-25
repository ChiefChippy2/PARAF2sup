const {Client, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags} = require('discord.js'); // eslint-disable-line
require('dotenv').config();
const text = require('../text.json');
const {appendFile} = require('fs/promises');

const prefix = text.idprefix;
const Cli = new Client({
  intents: 0,
});


Cli.login(process.env.TOKEN);

Cli.on('clientReady', ready);

Cli.on('interactionCreate', handleInteraction);

async function ready() {
  console.log(`${Cli.user.tag} Online!`);

  const channel = process.env.CHANNEL_ID;
  const chn = await Cli.channels.fetch(channel);
  if (!chn) console.error(`[FATAL] Failed to fetch channel (ID: ${channel})!`);

  if (!process.env.INIT) {
    try {
      await initInteraction(chn);
    } catch (e) {
      console.error(e);
      console.error('[FATAL] Failed to initiate Interaction!');
    }
  } else {
    // const chn = await Cli.channels.fetch(channel);
    // TBD
  }
}

async function initInteraction(chn) {
  // const guild = process.env.GUILD_ID;
  const row = new ActionRowBuilder();
  for (const info of text.form) {
    const [cat, name] = [info.category, info.label];
    const btn = new ButtonBuilder();
    btn.setCustomId(`${prefix}_0_${cat}`);
    btn.setLabel(name);
    btn.setStyle(ButtonStyle.Primary);
    row.addComponents(btn);
  }

  const msg = text.msg;
  if (msg.components) msg.components.push(row);
  else msg.components = [row];
  await chn.send(msg);
  await appendFile('.env', '\n\nINIT=1');
  console.log('[INFO] Boutons créés!');
}

/**
 *
 * @param {import('discord.js').Interaction} interaction
 */
async function handleInteraction(interaction) {
  if (interaction.customId.startsWith(`${prefix}_1`)) {
    await interaction.message?.fetch?.();
    const type = interaction.customId.split('_').slice(-1)[0];
    const info = text.form.find((el)=>el.category === type);
    const fieldsNo = info.questions.length;
    const response = [];
    for (let i = 1; i <= fieldsNo; i++) {
      response.push(interaction.fields.getTextInputValue(`Q${i}`));
    }

    console.log(response);
    // Save in case of failure
    await appendFile('../save', JSON.stringify([Date.now(), interaction.user.id, interaction.user.tag, ...response])+'\n');
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });
    // Fetch Apps Script endpoint
    if (process.env.APPS_SCRIPT_ENDPOINT_URL) {
      const send = await fetch(process.env.APPS_SCRIPT_ENDPOINT_URL, {
        method: 'POST',
        body: JSON.stringify({
          'timestamp': Date.now(),
          'userId': interaction.user.id,
          'userTag': interaction.user.tag,
          'fields': response,
          'userJoinDate': interaction.user.createdAt.getTime(),
        }),
        redirect: 'follow',
      }).then((r)=>r.status);
      if (send !== 200) {
        return await interaction.followUp({
          content: text.errMsg,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
    await interaction.followUp({
      content: text.successMsg,
      flags: MessageFlags.Ephemeral,
    });
  }
  if (!interaction.customId.startsWith(`${prefix}_0`)) {
    return;
  }
  const type = interaction.customId.split('_').slice(-1)[0];
  const info = text.form.find((el)=>el.category === type);
  const modal = new ModalBuilder()
      .setCustomId(`${prefix}_1_${info.category}`)
      .setTitle(info.title);

  let id = 1;
  const rows = [];
  for (const question of info.questions) {
    const input = new TextInputBuilder();
    input.setCustomId(`Q${id}`);
    input.setLabel(question.question);
    input.setStyle(TextInputStyle[question.style]);
    input.setPlaceholder(question.placeholder);
    rows.push(new ActionRowBuilder().addComponents(input));
    id ++;
  }
  modal.addComponents(...rows);
  await interaction.showModal(modal);
}
