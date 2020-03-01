const discord = require('discord.js');
const chalk = require('chalk');
const commons = require('../commons')

const run = config => {
    const { logger } = commons

    // Initialize Discord Bot
    const bot = new discord.Client();

    //Load Bot Modules
    config.MODULES.forEach((module, index) => {
        try{
            require('../modules/' + module)(bot, commons);
            logger.info(`Module ${chalk.bold.blue(module)} loaded [${index+1}/${config.MODULES.length}]`);
        }catch(err){
            logger.info(`Could not load module ${chalk.bold.blue(module)}: \n ${chalk.red(err.stack)}`);
        }
    });

    // Console log when ready.
    bot.on('ready', () => {
        logger.info(`Logged in as ${chalk.yellow(bot.user.tag)}`);
    });

    // Login
    bot.login(config.TOKEN);
}

module.exports = {
    run
}