
import { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';  // Use import instead of require
import dotenv from 'dotenv';  // Use import instead of require

dotenv.config();  // Initialize dotenv

// Initialize the client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Channel IDs from environment variables
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID;
const ANNOUNCEMENTS_CHANNEL_ID = process.env.ANNOUNCEMENTS_CHANNEL_ID;
const INTRODUCTIONS_CHANNEL_ID = process.env.INTRODUCTIONS_CHANNEL_ID;
const PROJECTS_CHANNEL_ID = process.env.PROJECTS_CHANNEL_ID;
const HAVE_FUN_CHANNEL_ID = process.env.HAVE_FUN_CHANNEL_ID;
const SKILL_SWAP_CHANNEL_ID = process.env.SKILL_SWAP_CHANNEL_ID;  // Added for skill swap
const FEEDBACK_CHANNEL_ID = process.env.FEEDBACK_CHANNEL_ID;

// Data storage for introductions, project ideas, and skill swap
const introductionData = [];
const projectIdeas = [];
const skillOffers = [];
const skillRequests = [];
const feedbackData = [];
// Fun command data
const jokes = [
  "Why don't skeletons fight each other? They don't have the guts!",
  "I'm reading a book on anti-gravity. It's impossible to put down!",
  "Why did the programmer quit his job? He didn't get arrays (a raise)!",
"Why did the computer keep freezing? It had too many windows open!",
"How many programmers does it take to change a light bulb? None, it's a hardware problem!",
"Why was the computer cold at the party? It left its Windows open!",

"Why did the computer go to art school? To improve its graphic skills!",
];
const triviaQuestions = [
  { question: "What is the capital of France?", answer: "paris" },
  { question: "Which planet is known as the Red Planet?", answer: "mars" },
];
const truths = ["What's your most embarrassing moment?",
  "What is the most embarrassing thing you’ve ever done?",
  "What’s a secret you’ve never told anyone?",
  "Have you ever had a crush on someone in this chat?",
  "If you could change one thing about yourself, what would it be?",
  "What’s the biggest lie you’ve ever told?",
  "Who was your first crush?",
  "What’s the most childish thing you still do?",
  "Have you ever cheated on a test?"




];
const dares = ["Sing a song for 10 seconds!"];
const responses = ["Yes!", "No!", "Maybe!", "Ask again later."];

// Define all slash commands
const commands = [
  // Introduction Command
  new SlashCommandBuilder()
    .setName('introduce')
    .setDescription('Introduce yourself to the server!')
    .addStringOption(option => option.setName('name').setDescription('Your name').setRequired(true))
    .addStringOption(option => option.setName('linkedin').setDescription('your linkedin id:').setRequired(true))
    .addStringOption(option => option.setName('role').setDescription('Your role or job title').setRequired(true))
    .addStringOption(option => option.setName('interests').setDescription('Your interests or hobbies').setRequired(true))
    ,


  // Announcement Command
  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement to the announcements channel')
    .addStringOption(option => option.setName('title').setDescription('Title of the announcement').setRequired(true))
    .addStringOption(option => option.setName('message').setDescription('Content of the announcement').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // Rules Command
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Display the server rules'),

  // Submit Project Idea Command
  new SlashCommandBuilder()
    .setName('submit-idea')
    .setDescription('Submit a project idea for pairing')
    .addStringOption(option => option.setName('title').setDescription('Title of your project idea').setRequired(true))
    .addStringOption(option => option.setName('description').setDescription('Brief description of your project').setRequired(true))
    .addStringOption(option => option.setName('tags').setDescription('Relevant tags or keywords').setRequired(true)),

  // List Project Ideas Command
  new SlashCommandBuilder()
    .setName('list-ideas')
    .setDescription('List all submitted project ideas'),

  // Skill Swap Commands
  new SlashCommandBuilder()
    .setName('offer-skill')
    .setDescription('Offer a skill you can teach')
    .addStringOption(option => option.setName('skill').setDescription('The skill you can teach').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('request-skill')
    .setDescription('Request a skill you want to learn')
    .addStringOption(option => option.setName('skill').setDescription('The skill you want to learn').setRequired(true)),

  new SlashCommandBuilder()
    .setName('swap-skills')
    .setDescription('Find skill swaps between offers and requests'),

  // Fun Commands
  new SlashCommandBuilder().setName('joke').setDescription('Get a random joke'),
  new SlashCommandBuilder().setName('8ball').setDescription('Ask the magic 8-ball a question'),
  new SlashCommandBuilder().setName('truth-or-dare').setDescription('Get a truth or dare challenge'),
  new SlashCommandBuilder().setName('gif').setDescription('Search for a GIF')
    .addStringOption(option => option.setName('keyword').setDescription('Keyword for the GIF').setRequired(false)),
].map(command => command.toJSON());

// Register commands function
const registerCommands = async () => {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.SERVER_ID),
      { body: commands }
    );
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
};

// Command handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options, channel } = interaction;

  // **Rules Command**
  if (commandName === 'rules') {
    if (channel.id !== RULES_CHANNEL_ID) {
      return interaction.reply({ content: '❌ Please use this command in the rules channel.', ephemeral: true });
    }
    const rulesMessage = `📜 **Server Rules**:\n1. Be respectful.\n2. No spamming.\n3. Use appropriate channels.\n4. No self-promotion.\n5. Follow [Discord Guidelines](https://discord.com/guidelines).`;
    return interaction.reply(rulesMessage);
  }

  // **Announce Command**
  if (commandName === 'introduce') {
    if (channel.id !== INTRODUCTIONS_CHANNEL_ID) {
      return interaction.reply({ content: '❌ Please use this command in the introductions channel.', ephemeral: true });
    }
  
    const name = options.getString('name');
    const linkedin = options.getString('linkedin');
    const role = options.getString('role');
    const interests = options.getString('interests');
    
  
    // Store introduction data (optional storage usage)
    introductionData.push({ name, interests: interests.toLowerCase().split(', '), linkedin });
  
    // Construct the introduction message
    const introMessage = `
      👋 **Introduction**
      **Name**: ${name}
      **Linkedin**: ${linkedin}
      **Role**: ${role}
      **Interests**: ${interests}
      
    `;
  
    return interaction.reply(introMessage);
  }
  

  // **Submit Project Idea Command**
  if (commandName === 'submit-idea') {
    const title = options.getString('title');
    const description = options.getString('description');
    const tags = options.getString('tags').toLowerCase().split(', ');
    projectIdeas.push({ title, description, tags });
    return interaction.reply(`✅ Project submitted: **${title}**`);
  }

  // **List Project Ideas Command**
  if (commandName === 'list-ideas') {
    const listedIdeas = projectIdeas.map(idea => `**${idea.title}** - ${idea.description}`).join('\n') || 'No project ideas found.';
    return interaction.reply(listedIdeas);
  }

  // **Skill Swap Commands**
  if (commandName === 'offer-skill') {
    const skill = options.getString('skill');
    skillOffers.push({ user: interaction.user.tag, skill });
    return interaction.reply(`✅ You have offered to teach **${skill}**`);
  }

  if (commandName === 'request-skill') {
    const skill = options.getString('skill');
    skillRequests.push({ user: interaction.user.tag, skill });
    return interaction.reply(`✅ You have requested to learn **${skill}**`);
  }

  if (commandName === 'swap-skills') {
    let matchedSkills = [];

    // Match offered and requested skills
    skillOffers.forEach(offer => {
      skillRequests.forEach(request => {
        if (offer.skill.toLowerCase() === request.skill.toLowerCase()) {
          matchedSkills.push(`Matched: **${offer.skill}** - ${offer.user} (Offered) & ${request.user} (Requested)`);
        }
      });
    });

    // If no matches found, notify the user
    if (matchedSkills.length > 0) {
      return interaction.reply(matchedSkills.join('\n'));
    } else {
      return interaction.reply('No skill swaps found. Try offering/requesting different skills.');
    }
  }

  // **Fun Commands**
  const isFunCommand = ['joke', '8ball', 'truth-or-dare', 'gif'].includes(commandName);
  if (isFunCommand && channel.id !== HAVE_FUN_CHANNEL_ID) {
    return interaction.reply({ content: '❌ Please use this command in the Have Fun channel.', ephemeral: true });
  }

  if (commandName === 'joke') {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return interaction.reply(joke);
  }

  if (commandName === '8ball') {
    const answer = responses[Math.floor(Math.random() * responses.length)];
    return interaction.reply(`🎱 ${answer}`);
  }

  if (commandName === 'truth-or-dare') {
    const challenge = Math.random() < 0.5 ? truths[Math.floor(Math.random() * truths.length)] : dares[Math.floor(Math.random() * dares.length)];
    return interaction.reply(challenge);
  }

  if (commandName === 'gif') {
    const keyword = options.getString('keyword') || 'funny';
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=${keyword}&limit=1`);
    const data = await response.json();
    const gifUrl = data.data.length ? data.data[0].url : "No GIF found!";
    return interaction.reply(gifUrl);
  }
});
const feedbackCommands = [
  new SlashCommandBuilder()
    .setName('give-feedback')
    .setDescription('Submit feedback about the server or bot')
    .addStringOption(option => 
      option.setName('message')
        .setDescription('Your feedback message')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('list-feedback')
    .setDescription('List all submitted feedback')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Restrict access to admins

  new SlashCommandBuilder()
    .setName('clear-feedback')
    .setDescription('Clear all feedback data')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Restrict access to admins
];

// Register feedback commands
commands.push(...feedbackCommands.map(command => command.toJSON()));

// **Feedback Command Handler**
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const { commandName, options, channel, user } = interaction;

  // **Give Feedback Command**
  if (commandName === 'give-feedback') {
    const feedbackMessage = options.getString('message');
    
    // Store the feedback with username and feedback content
    feedbackData.push({ user: user.tag, message: feedbackMessage });

    // Notify the feedback channel (optional)
    const feedbackChannel = client.channels.cache.get(FEEDBACK_CHANNEL_ID);
    if (feedbackChannel) {
      await feedbackChannel.send(`📝 **New Feedback**\nFrom: ${user.tag}\nFeedback: ${feedbackMessage}`);
    }

    // Reply to user
    return interaction.reply({ content: '✅ Thank you for your feedback!', ephemeral: true });
  }

  // **List Feedback Command**
  if (commandName === 'list-feedback') {
    if (feedbackData.length === 0) {
      return interaction.reply({ content: 'No feedback found.', ephemeral: true });
    }
    
    const feedbackList = feedbackData
      .map((feedback, index) => `**#${index + 1}** - ${feedback.user}: ${feedback.message}`)
      .join('\n');
    
    // Display all feedback to the admin
    return interaction.reply({ content: `📝 **Feedback List**:\n${feedbackList}`, ephemeral: true });
  }

  // **Clear Feedback Command**
  if (commandName === 'clear-feedback') {
    feedbackData.length = 0;  // Clear the feedback data
    return interaction.reply({ content: '✅ All feedback has been cleared.', ephemeral: true });
  }
});

// Bot ready event
client.once('ready', async () => {
  console.log(`Bot is online as ${client.user.tag}`);
  await registerCommands();
});

// Login the bot
client.login(process.env.TOKEN);

// Import dependencies
// import { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, Routes } from 'discord.js';
// import { REST } from '@discordjs/rest';
// import fetch from 'node-fetch';
// import dotenv from 'dotenv';

// dotenv.config();

// const client = new Client({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.MessageContent,
//     GatewayIntentBits.GuildMembers,
//   ],
// });

// const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID;
// const INTRODUCTIONS_CHANNEL_ID = process.env.INTRODUCTIONS_CHANNEL_ID;
// const HAVE_FUN_CHANNEL_ID = process.env.HAVE_FUN_CHANNEL_ID;
// const FEEDBACK_CHANNEL_ID = process.env.FEEDBACK_CHANNEL_ID;

// const introductionData = [];
// const projectIdeas = [];
// const skillOffers = [];
// const skillRequests = [];
// const feedbackData = [];
// const jokes = ["Why don't skeletons fight each other? They don't have the guts!"];
// const responses = ["Yes!", "No!", "Maybe!", "Ask again later."];
// const truths = ["What's your most embarrassing moment?"];
// const dares = ["Sing a song for 10 seconds!"];

// // Define all slash commands
// const commands = [
//   new SlashCommandBuilder()
//     .setName('introduce')
//     .setDescription('Introduce yourself')
//     .addStringOption(option => option.setName('name').setDescription('Your name').setRequired(true))
//     .addStringOption(option => option.setName('linkedin').setDescription('LinkedIn ID').setRequired(true))
//     .addStringOption(option => option.setName('role').setDescription('Your role').setRequired(true))
//     .addStringOption(option => option.setName('interests').setDescription('Your interests').setRequired(true)),
  
//   new SlashCommandBuilder()
//     .setName('rules')
//     .setDescription('Display server rules'),
  
//   new SlashCommandBuilder()
//     .setName('submit-idea')
//     .setDescription('Submit a project idea')
//     .addStringOption(option => option.setName('title').setDescription('Title').setRequired(true))
//     .addStringOption(option => option.setName('description').setDescription('Description').setRequired(true))
//     .addStringOption(option => option.setName('tags').setDescription('Tags').setRequired(true)),
  
//   new SlashCommandBuilder().setName('list-ideas').setDescription('List all project ideas'),
  
//   new SlashCommandBuilder()
//     .setName('offer-skill')
//     .setDescription('Offer a skill')
//     .addStringOption(option => option.setName('skill').setDescription('The skill').setRequired(true)),
  
//   new SlashCommandBuilder()
//     .setName('request-skill')
//     .setDescription('Request a skill')
//     .addStringOption(option => option.setName('skill').setDescription('The skill').setRequired(true)),
  
//   new SlashCommandBuilder().setName('swap-skills').setDescription('Find skill swaps'),
  
//   new SlashCommandBuilder().setName('joke').setDescription('Get a joke'),
//   new SlashCommandBuilder().setName('8ball').setDescription('Ask the magic 8-ball a question'),
//   new SlashCommandBuilder().setName('truth-or-dare').setDescription('Play truth or dare'),
  
//   new SlashCommandBuilder()
//     .setName('give-feedback')
//     .setDescription('Give feedback')
//     .addStringOption(option => option.setName('message').setDescription('Your feedback').setRequired(true)),
  
//   new SlashCommandBuilder().setName('list-feedback').setDescription('List all feedback').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
//   new SlashCommandBuilder().setName('clear-feedback').setDescription('Clear feedback').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
// ].map(command => command.toJSON());

// // Register commands
// const registerCommands = async () => {
//   const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
//   await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.SERVER_ID), { body: commands });
// };

// // Handle interactions
// client.on('interactionCreate', async interaction => {
//   if (!interaction.isCommand()) return;
  
//   const { commandName, options, channel, user } = interaction;
  
//   if (commandName === 'introduce') {
//     const name = options.getString('name');
//     const linkedin = options.getString('linkedin');
//     const role = options.getString('role');
//     const interests = options.getString('interests');
//     introductionData.push({ name, linkedin, role, interests });
//     interaction.reply(`👋 Name: ${name}\nRole: ${role}\nInterests: ${interests}\nLinkedIn: ${linkedin}`);
//   }
  
//   if (commandName === 'joke') {
//     interaction.reply(jokes[Math.floor(Math.random() * jokes.length)]);
//   }

//   if (commandName === '8ball') {
//     interaction.reply(`🎱 ${responses[Math.floor(Math.random() * responses.length)]}`);
//   }

//   if (commandName === 'truth-or-dare') {
//     const challenge = Math.random() < 0.5 ? truths[Math.floor(Math.random() * truths.length)] : dares[Math.floor(Math.random() * dares.length)];
//     interaction.reply(challenge);
//   }

//   if (commandName === 'give-feedback') {
//     const feedbackMessage = options.getString('message');
//     feedbackData.push({ user: user.tag, message: feedbackMessage });
//     interaction.reply('Thank you for your feedback!');
//   }

//   if (commandName === 'list-feedback') {
//     const feedbackList = feedbackData.map((fb, i) => `#${i + 1} - ${fb.user}: ${fb.message}`).join('\n');
//     interaction.reply(feedbackList || 'No feedback yet.');
//   }

//   if (commandName === 'clear-feedback') {
//     feedbackData.length = 0;
//     interaction.reply('Feedback cleared!');
//   }
// });

// // Ready event
// client.once('ready', () => {
//   console.log(`Bot is online as ${client.user.tag}`);
//   registerCommands();
// });

// client.login(process.env.TOKEN);
