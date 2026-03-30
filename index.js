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
const CLIENT_ID = "PASTE_YOUR_CLIENT_ID_HERE";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// ✅ REGISTER COMMANDS
const commands = [
  new SlashCommandBuilder()
    .setName('percentage')
    .setDescription('Calculate a percentage'),

  new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Create a sell entry')
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
        .setTitle('Percentage Calculator');

      const numberInput = new TextInputBuilder()
        .setCustomId('number')
        .setLabel('Enter number')
        .setStyle(TextInputStyle.Short);

      const percentInput = new TextInputBuilder()
        .setCustomId('percent')
        .setLabel('Enter percentage')
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
        .setTitle('Sell Item');

      const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Your name')
        .setStyle(TextInputStyle.Short);

      const objectInput = new TextInputBuilder()
        .setCustomId('object')
        .setLabel('Object')
        .setStyle(TextInputStyle.Short);

      const quantityInput = new TextInputBuilder()
        .setCustomId('quantity')
        .setLabel('Quantity')
        .setStyle(TextInputStyle.Short);

      const priceInput = new TextInputBuilder()
        .setCustomId('price')
        .setLabel('Price')
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
          content: '❌ Please enter valid numbers!',
          ephemeral: true
        });
      }

      const result = number * (percent / 100);

      await interaction.reply({
        embeds: [
          {
            title: "📊 Percentage Calculator",
            fields: [
              { name: "Number", value: `${number}`, inline: true },
              { name: "Percentage", value: `${percent}%`, inline: true },
              { name: "Result", value: `${result}`, inline: false }
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
        content: "✅ Sale posted!",
        ephemeral: true
      });

      // PUBLIC message (everyone sees this)
      await interaction.channel.send({
        embeds: [
          {
            title: "🛒 New Sale",
            fields: [
              { name: "Name", value: name, inline: true },
              { name: "Object", value: object, inline: true },
              { name: "Quantity", value: quantity, inline: true },
              { name: "Price", value: price, inline: true }
            ]
          }
        ]
      });
    }
  }
});

client.login(TOKEN);
