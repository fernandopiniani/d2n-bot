const discord = require('discord.js');
const chalk = require('chalk');
const commons = require('../commons')

const run = config => {
    // Initialize Discord Bot
    const bot = new discord.Client();

    //Load Bot Modules
    config.MODULES.forEach((module, index) => {
        try{
            require('../modules/' + module)(bot, commons);
            console.log(`d2n-bot# Module ${chalk.bold.blue(module)} loaded [${index+1}/${config.MODULES.length}]`);
        }catch(err){
            console.log(`d2n-bot# Could not load module ${chalk.bold.blue(module)}: \n ${chalk.red(err.stack)}`);
        }
    });

    // Console log when ready.
    bot.on('ready', () => {
        console.log(`d2n-bot# Logged in as ${chalk.yellow(bot.user.tag)}`);
    });

    // Login
    bot.login(config.TOKEN);
}

module.exports = {
    run
}