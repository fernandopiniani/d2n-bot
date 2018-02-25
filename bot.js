const Discord = require('discord.js');
const config = require('./config.json');

// Initialize Discord Bot
const bot = new Discord.Client();

//Load Bot Modules
config.modules.map(
  module => {
    try{
        require('./bot_modules/' + module)(bot);
        console.log(`d2n-bot# Module ${module} loaded.`);
    }catch(err){
        console.log(`d2n-bot# Error on loading module ${module}: \n ${err}`);
    }
});

// Console log when ready.
bot.on('ready', () => {
    console.log(`d2n-bot# Logged in as ${bot.user.tag}!`);
});

// Login
bot.login(config.token);
