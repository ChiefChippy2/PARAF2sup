const {EmbedBuilder} = require('discord.js');
const text = require('../text.json');

/**
 * Sends modal details to discord
 * @param {import("discord.js").Interaction} interaction
 * @param {string} desc
 * @param {Object} questions
 */
async function sendToLogChannel(interaction, desc, questions) {
  const Cli = interaction.client;
  if (Cli.logChannel) {
    const fields = interaction.fields.components.map((x, i)=>{
      return {
        name: questions[i].question,
        value: '```'+x.components[0].value.replaceAll('`', '\\`')+'```',
      };
    });
    const embed = new EmbedBuilder()
        .setTitle(text.receivedResponse)
        .setDescription(desc)
        .setTimestamp(Date.now())
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields(fields);
    return await Cli.logChannel.send({embeds: [embed]});
  }
}

module.exports = {sendToLogChannel};
