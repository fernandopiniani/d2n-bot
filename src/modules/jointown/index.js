const moment = require('moment')

const COMMAND_NAME = 'jointown'
const TOWNS_CATEGORY = 'TOWNS'

const sendTipMessage = member => {
  member.member.createDM().then(directMessage => {
    directMessage.sendMessage(`Tip: If you're currently playing in a town type !${COMMAND_NAME} "Your Town Name Here" on the channel`)
  })
}

const findOrCreateTownsCategory = guild => {
  // Try to find a category channel named towns
  const townsCategory = guild.channels.find(channel =>
    channel.name.toUpperCase() === TOWNS_CATEGORY && channel.type === 'category')

  // Return existent category channel named town or create one.
  return townsCategory ||
    guild.createChannel(TOWNS_CATEGORY, { type: 'category' })
}

const findOrCreateCustomTownRole = (guild, townName) => {
  // Try to find a role named with town's name.
  const townRole = guild.roles.find(role =>
    role.name.toUpperCase() === townName.replace(/ /g, '-').toUpperCase())

  // Return existent town role or create one.
  return townRole ||
    guild.createRole({ name: townName.toLowerCase() })
}

const findOrCreateCustomTownChannel = async (guild, category, role, townName) => {
  // Try to find a channel named with town's name.
  const townChannel = guild.channels.find(channel => channel.name.toUpperCase() === townName.replace(/ /g, '-').toUpperCase())

  // If town's channel not exists.
  return townChannel ||
    guild.createChannel(townName.replace(/ /g, '-'), '')
      .then(newChannel => {
        newChannel.overwritePermissions(guild.defaultRole, { VIEW_CHANNEL: false })

        // Set town's channel inside the Towns category.
        newChannel.setParent(category)

        // Overwrite the permissions of town's role to make channel visible.
        newChannel.overwritePermissions(role, { VIEW_CHANNEL: true })
      })
}

const joinOrCreateTownChannel = async (msg, { params: [townName] }) => {
  const { guild } = msg

  const townsCategory = await findOrCreateTownsCategory(guild)

  const townRole = await findOrCreateCustomTownRole(guild, townName)

  const townChannel = await findOrCreateCustomTownChannel(guild, townsCategory, townRole, townName)

  // Add role to the user.
  await msg.member.addRole(townRole)

  // Send a greetings message in the town's chat.
  townChannel.send(`Welcome to the town's channel, ${msg.author}!`)
}

/**
* Join module is responsible for the management of multiple towns in one
* discord server. Using join module, members will be able to create private
* chats and use as it pleases. Since this feature is created to help town's folk
* to communicate and, eventually, every town reach to and end, channels will be
* deleted when inactive.
*/
module.exports = (bot, { commands }) => {
  /**
    * Give a tip to newcomers.
    */
  bot.on('guildMemberAdd', sendTipMessage)

  /**
    * Creates and/or join an town's channel.
    */
  bot.on('message', commands.handleCommand(COMMAND_NAME, joinOrCreateTownChannel))

  /**
    * Deletes inactive town channels.
    * Note: By 'town channels' I mean all channels under towns category.
    * Originally it was made under 'channelCreate' event, but I've found some
    * problems with the parent
    */
  bot.on('channelUpdate', (oldChannel, newChannel) => {
    // Get channel's guild
    const { guild } = newChannel

    // Try to find a category channel named towns
    const townsCategoryChannel = findOrCreateTownsCategory(guild)

    // Delete all town channels that...
    guild.channels.map((channel) => {
      // ...are in towns category and...
      if (channel.parent && channel.parent.equals(townsCategoryChannel)) {
        // console.log(`Fetching messages on channel ${channel.name}`);
        channel.fetchMessages({ limit: 1 }).then(messages => {
          const lastMessage = messages.first()
          // ...which last message are at least 2 days old.
          if (moment(lastMessage.createdAt) < moment().subtract(2, 'days')) {
            // If condition is true, delete the channel, then...
            channel.delete().then(channel => {
              // Search for the respective channel role.
              const channelRole = channel.guild.roles.find(role => {
                return role.name.replace(/ /g, '-').toUpperCase() === channel.name.toUpperCase()
              })

              // And delete it role.
              // console.log(`Deleting role ${channelRole.name}`);
              channelRole.delete().then(role => console.log(role.name + ' deleted.')).catch(err => console.log('error on deleting role -> ', err))
            })
          }
        })
      }
    })
  })
}
