module.exports = (bot) => {
    const commandName = 'help';

    bot.on('message', msg => {
        const cmdInfo = bot.handleCommand(msg.content);

        if(!cmdInfo || cmdInfo.cmd !== commandName) return;

        msg.channel.send(`Sorry, ${msg.author}, I'm busy now.\nIf you're looking for more information go check these old pages: https://github.com/fernandopiniani/d2n-bot`);
    });
}
