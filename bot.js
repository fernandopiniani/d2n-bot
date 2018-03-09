const discord = require('discord.js');
const splitargs = require('splitargs');
const chalk = require('chalk');
const config = require('./config.json');

// Initialize Discord Bot
const bot = new discord.Client();

/**
* Command parser responsible for abstracting commands from messages.
* @param  {[string]} msg
*   Textual message which follows the structure:
*   <key><cmd> <arg[0]> <arg[1]> <arg[2]>...<arg[n]> *
* @return {[{key: string, cmd: string, args: array }]}
*   Returns an object with isolated command properties.
*/
bot.handleCommand = (msg) => {
    //Trims whitespace from the beginning and end of the string.
    msg = msg.trim();

    //If special key is the first character -- it's a command!
    if (msg.substring(0, 1) == '!') {
        //Get the special key
        let key = msg[0];

        //Transform the following text in argument
        let args = splitargs(msg.substring(1));

        //The first argument will be the command name
        let cmd = args.shift();

        //Return the structred object
        return {key, cmd, args};
    }
}

//Load Bot Modules
config.modules.map((module, index) => {
    try{
        require('./bot_modules/' + module)(bot);
        console.log(`d2n-bot# Module ${chalk.bold.blue(module)} loaded [${index+1}/${config.modules.length}]`);
    }catch(err){
        console.log(`d2n-bot# Could not load module ${chalk.bold.blue(module)}: \n ${chalk.red(err.stack)}`);
    }
});

// Console log when ready.
bot.on('ready', () => {
    console.log(`d2n-bot# Logged in as ${chalk.yellow(bot.user.tag)}`);
});

// Login
bot.login(config.token);
