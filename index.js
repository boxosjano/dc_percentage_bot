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

// 🔐 Use Railway environment variable
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1487373541488721920";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// ✅ REGISTER COMMANDS
const commands = [
  new SlashCommandBuilder()
    .setName('szazalek')
    .setDescription('Százalék számolása'),

  new SlashCommandBuilder()
    .setName('eladas')
    .setDescription('Eladás feljegyzése')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registering commands...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('Commands registered!');
  } catch (error) {
    console.error(error);
  }
});


// ✅ BOT READY
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});


// ✅ HANDLE INTERACTIONS
client.on(Events.InteractionCreate, async interaction => {

  // 🔹 SLASH COMMANDS
  if (interaction.isChatInputCommand()) {

    // ===== /percentage =====
    if (interaction.commandName === 'percentage') {

      const modal = new ModalBuilder()
        .setCustomId('percentage_modal')
        .setTitle('Százalék számoló');

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

    // ===== /sell =====
    if (interaction.commandName === 'sell') {

      const modal = new ModalBuilder()
        .setCustomId('sell_modal')
        .setTitle('Eladás');

      const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Név')
        .setStyle(TextInputStyle.Short);

      const objectInput = new TextInputBuilder()
        .setCustomId('object')
        .setLabel('Tárgy')
        .setStyle(TextInputStyle.Short);

      const quantityInput = new TextInputBuilder()
        .setCustomId('quantity')
        .setLabel('Mennyiség')
        .setStyle(TextInputStyle.Short);

      const priceInput = new TextInputBuilder()
        .setCustomId('price')
        .setLabel('Ár')
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(objectInput),
        new ActionRowBuilder().addComponents(quantityInput),
        new ActionRowBuilder().addComponents(priceInput)
      );

      await interaction.showModal(modal);
    }
  }

  // 🔹 MODAL SUBMIT
  if (interaction.isModalSubmit()) {

    // ===== percentage result =====
    if (interaction.customId === 'percentage_modal') {

      const number = parseFloat(interaction.fields.getTextInputValue('number'));
      const percent = parseFloat(interaction.fields.getTextInputValue('percent'));

      if (isNaN(number) || isNaN(percent)) {
        return interaction.reply({
          content: '❌ Számokat adj meg!',
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

    // ===== sell result =====
    if (interaction.customId === 'sell_modal') {

      const name = interaction.fields.getTextInputValue('name');
      const object = interaction.fields.getTextInputValue('object');
      const quantity = interaction.fields.getTextInputValue('quantity');
      const price = interaction.fields.getTextInputValue('price');

      // Private confirmation
      await interaction.reply({
        content: "✅ Sikeres feljegyzés!",
        ephemeral: true
      });

      // PUBLIC message (everyone sees this)
      await interaction.channel.send({
        embeds: [
          {
            title: "🛒 Új Eladás",
            fields: [
              { name: "Név", value: name, inline: true },
              { name: "Tárgy", value: object, inline: true },
              { name: "Mennyiség", value: quantity, inline: true },
              { name: "Ár", value: price, inline: true }
            ]
          }
        ]
      });
    }
  }
});

client.login(TOKEN);
