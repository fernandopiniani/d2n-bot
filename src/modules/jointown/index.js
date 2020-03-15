const moment = require('moment')

const COMMAND_NAME = 'jointown'
const TOWNS_CATEGORY = 'TOWNS'

/**
* Join module is responsible for the management of multiple towns in one
* discord server. Using join module, members will be able to create private
* chats and use as it pleases. Since this feature is created to help town's folk
* to communicate and, eventually, every town reach to and end, channels will be
* deleted when inactive.
*/
module.exports = (bot, { commands, error, logger }) => {
  const isUnderTownsCategory = async (guild, channel) => {
    const townsCategoryChannel = findOrCreateTownsCategory(guild)
    return channel.parent.id === townsCategoryChannel.id
  }

  const findOrCreateTownsCategory = async guild => {
    const townsCategory = guild.channels.find(channel =>
      channel.name.toUpperCase() === TOWNS_CATEGORY && channel.type === 'category')

    if (townsCategory) {
      logger.debug(`Found town's category: ${townsCategory.name}`)
      return townsCategory
    } else {
      const channel = await guild.createChannel(TOWNS_CATEGORY, { type: 'category' })
      logger.info(`Category channel created ${channel.id} ${channel.name}`)
      return channel
    }
  }

  const findOrCreateCustomTownRole = async (guild, townName) => {
    const townRole = guild.roles.find(role =>
      role.name.toUpperCase() === townName.replace(/ /g, '-').toUpperCase())

    if (townRole) {
      logger.debug(`Found town's role: ${townRole.name}`)
      return townRole
    } else {
      const role = await guild.createRole({ name: townName.toLowerCase() })
      logger.info(`Role created ${role.id} ${role.name}`)
      return role
    }
  }

  const findOrCreateCustomTownChannel = async (guild, category, role, townName) => {
    const townChannel = guild.channels.find(channel => channel.name.toUpperCase() === townName.replace(/ /g, '-').toUpperCase())

    if (townChannel) {
      logger.debug(`Found town's channel: ${townChannel.name}`)
      return townChannel
    } else {
      const channel = await guild.createChannel(townName.replace(/ /g, '-'), { type: 'text' })
        .then(newChannel => {
          newChannel.overwritePermissions(guild.defaultRole, { VIEW_CHANNEL: false })

          // Set town's channel inside the Towns category.
          newChannel.setParent(category)

          // Overwrite the permissions of town's role to make channel visible.
          newChannel.overwritePermissions(role, { VIEW_CHANNEL: true })

          return newChannel
        })
      logger.info(`Town channel created ${channel.id} ${channel.name}`)
      return channel
    }
  }

  /**
    * Give a tip to newcomers.
    */
  bot.on('guildMemberAdd', error.errorMiddleware(member => {
    member.member.createDM().then(directMessage => {
      directMessage.sendMessage(`Tip: If you're currently playing in a town type !${COMMAND_NAME} "Your Town Name Here" on the channel`)
    })
  }))

  /**
    * Creates and/or join an town's channel.
    */
  bot.on('message', error.errorMiddleware(commands.handleCommand(COMMAND_NAME, async (msg, { params: [townName] }) => {
    const { guild } = msg

    const townsCategory = await findOrCreateTownsCategory(guild)

    const townRole = await findOrCreateCustomTownRole(guild, townName)

    const townChannel = await findOrCreateCustomTownChannel(guild, townsCategory, townRole, townName)

    // Add role to the user.
    await msg.member.addRole(townRole)

    // Send a greetings message in the town's chat.
    await townChannel.send(`Welcome to the town's channel, ${msg.author}!`)
  })))

  /**
    * Deletes inactive town channels.
    * Note: By 'town channels' I mean all channels under towns category.
    * Originally it was made under 'channelCreate' event, but I've found some
    * problems with the parent
   */
  bot.on('channelCreate', error.errorMiddleware(newChannel => {
    const { guild } = newChannel

    const townChannels = guild.channels.filter(channel => isUnderTownsCategory(guild, channel))

    townChannels.each(channel => {
      channel.fetchMessages({ limit: 1 }).then(messages => {
        const lastMessage = messages.first()
        if (moment(lastMessage.createdAt) < moment().subtract(2, 'days')) {
          channel.delete().then(logger.info(`Channel ${channel.name} deleted!`))
        }
      })
    })
  }))

  bot.on('channelDelete', channel => {
    const { guild } = channel

    const role = guild.roles.find(role => {
      return role.name.replace(/ /g, '-').toUpperCase() === channel.name.toUpperCase()
    })

    role && role.delete()
  })
}
