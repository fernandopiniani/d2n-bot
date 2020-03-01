const sendHelpMessage = msg => {
    return msg.channel.send(`Sorry, ${msg.author}, I'm busy now.\nIf you're looking for more information go check these old pages: https://github.com/fernandopiniani/d2n-bot`);
}

const sendCommandsMessage = msg => {
    return msg.channel.send(`For now, you can use the following commands:
    - !help
    - !jointown "<town-name>"
    - !register <twinoid-profile-url>`)
}

module.exports = (bot, { commands }) => {
    bot.on('message', commands.handleCommand('help', async msg => {
        await sendHelpMessage(msg)
        await sendCommandsMessage(msg)
    }))
}
