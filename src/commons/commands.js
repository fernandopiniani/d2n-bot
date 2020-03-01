const splitargs = require('splitargs');
const chalk = require('chalk')
/**
* Command parser responsible for abstracting commands from messages.
* @param  {[string]} msg
*   Textual message which follows the structure:
*   <key><cmd> <arg[0]> <arg[1]> <arg[2]>...<arg[n]> *
* @return {[{key: string, cmd: string, args: array }]}
*   Returns an object with isolated command properties.
*/
const handleCommand = (commandName, fn) => msg =>{
    //Trims whitespace from the beginning and end of the string.
    const messageStr = msg.content.trim();

    //If special key is the first character -- it's a command!
    if (messageStr.substring(0, 1) == '!') {
        //Get the special key
        const key = messageStr[0];

        // The first argument will be the command name
        // The rest will be parameters
        const [cmd, ...params] = splitargs(messageStr.substring(1));

        //Return the structred object
        if(cmd === commandName) {
            console.log(`${chalk.blue(commandName)} command was called with following parameters: [${params.map(p => chalk.yellow(p))}]`)
            return fn(msg, {cmd, params})
        }
    }
}

module.exports = {
    handleCommand
}