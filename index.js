const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1487373541488721920";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// ✅ REGISTER SLASH COMMAND
const commands = [
  new SlashCommandBuilder()
    .setName('percentage')
    .setDescription('Calculate a percentage')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registering command...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('Command registered!');
  } catch (error) {
    console.error(error);
  }
})();


// ✅ BOT READY
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});


// ✅ HANDLE INTERACTIONS
client.on(Events.InteractionCreate, async interaction => {

  // 🔹 Slash command → OPEN MODAL INSTANTLY
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'percentage') {

      const modal = new ModalBuilder()
        .setCustomId('percentage_modal')
        .setTitle('Százalék');

      const numberInput = new TextInputBuilder()
        .setCustomId('number')
        .setLabel('Szám')
        .setStyle(TextInputStyle.Short);

      const percentInput = new TextInputBuilder()
        .setCustomId('percent')
        .setLabel('Százalék')
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(numberInput),
        new ActionRowBuilder().addComponents(percentInput)
      );

      await interaction.showModal(modal);
    }
  }

  // 🔹 Modal submit → CALCULATE RESULT
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'percentage_modal') {

      const number = parseFloat(interaction.fields.getTextInputValue('number'));
      const percent = parseFloat(interaction.fields.getTextInputValue('percent'));

      if (isNaN(number) || isNaN(percent)) {
        return interaction.reply({
          content: '❌ Számokat adj meg',
          ephemeral: true
        });
      }

      const result = number * (percent / 100);

      await interaction.reply({
        embeds: [
          {
            title: "📊 Százalék számoló",
            fields: [
              { name: "Szám", value: `${number}`, inline: true },
              { name: "Százalék", value: `${percent}%`, inline: true },
              { name: "Eredmény", value: `${result}`, inline: false }
            ]
          }
        ],
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);