module.exports = (bot) => {
  bot.on('guildMemberAdd', member => {
      member.
      member.createDM()
      .then(dm => {
          dm.sendMessage(`Greetings ${member.user}! Welcome to our humble community.`);
      });
  });
}
