const moment = require('moment');

/**
* Join module is responsible for the management of multiple towns in one
* discord server. Using join module, members will be able to create private
* chats and use as it pleases. Since this feature is created to help town's folk
* to communicate and, eventually, every town reach to and end, channels will be
* deleted when inactive.
* @param  {[object]} bot d2n-bot core
* @param  {[object]} config optional configuration
*/
module.exports = (bot, config = null) => {

    const commandName = 'jointown';

    const commandConfig = {
        ...config,
        verbose: true,
    }

    /**
    // * Give a tip to newcomers.
    // */
    // bot.on('guildMemberAdd', member => {
    //     member.
    //     member.createDM()
    //     .then(dm => {
    //         //Messages the player
    //         dm.sendMessage(`Tip: If you're currently playing in a town type !${commandName} "Your Town Name Here" on the channel`);
    //     });
    // });

    /**
    * Creates and/or join an town's channel.
    */
    bot.on('message', async (msg) => {

        const cmdInfo = bot.handleCommand(msg.content);

        if(!cmdInfo || cmdInfo.cmd !== commandName || cmdInfo.args.length == 0) return;

        // ### COMMAND BEGINS ###
        const {verbose} = commandConfig;

        try{
            const guild = msg.guild;

            //Get the first parameter -- the town's name.
            const townName = cmdInfo.args[0];

            //Try to find a category channel named towns
            let townsCategoryChannel = guild.channels.find(channel => channel.name.toUpperCase() === 'TOWNS' && channel.type === 'category');

            //If category channel named town not exists, create.
            if(!townsCategoryChannel)
            townsCategoryChannel = await guild.createChannel('TOWNS', 'category')


            //Try to find a role named as the town's name.
            let townRole = guild.roles.find(role => role.name.toUpperCase() == townName.replace(/ /g, '-').toUpperCase())

            //If town's channel not exists.
            if(!townRole) {
                //Create role.
                townRole = await guild.createRole({name: townName.toLowerCase()})
            }

            //Try to find a channel named as the town's name.
            let townChannel = guild.channels.find(channel => channel.name.toUpperCase() == townName.replace(/ /g, '-').toUpperCase())

            //If town's channel not exists.
            if(!townChannel) {
                //Create town channel.
                townChannel = await guild.createChannel(townName.replace(/ /g, '-'), '');

                //Disable VIEW_CHANNEL permission by default.
                await townChannel.overwritePermissions(guild.defaultRole, {VIEW_CHANNEL: false});

                //Set town's channel inside the Towns category.
                await townChannel.setParent(townsCategoryChannel);

                console.log(townChannel.parent);

                //Overwrite the permissions of town's role to make channel visible.
                await townChannel.overwritePermissions(townRole, {VIEW_CHANNEL: true});
            }

            //Delete the message command.

            //Add role to the user.
            await msg.member.addRole(townRole);

            //Send a greetings message in the town's chat.
            townChannel.send(`Welcome to the town's channel, ${msg.author}!`);
        }catch(err){
            console.log('Error -> ', err);
        }
    });

    /**
    * Deletes inactive town channels.
    * Note: By 'town channels' I mean all channels under towns category.
    * Originally it was made under 'channelCreate' event, but I've found some
    * problems with the parent
    */
    bot.on('channelUpdate', (oldChannel, newChannel) => {
        //console.log("Channel create event triggered");

        try {
            //Get channel's guild
            const guild = newChannel.guild;

            //Try to find a category channel named towns
            const townsCategoryChannel = guild.channels.find(channel => channel.name.toUpperCase() === 'TOWNS'  && channel.type === 'category');

            //Delete all town channels that...
            guild.channels.map((channel) => {
                console.log('Channel: ', channel.name);
                console.log('Parent: ', channel.parent ? channel.parent.name : null);
                // ...are in towns category and...
                if (channel.parent && channel.parent.equals(townsCategoryChannel)){
                    //console.log(`Fetching messages on channel ${channel.name}`);
                    channel.fetchMessages({ limit: 1 }).then(messages => {

                        const lastMessage = messages.first();
                        // ...which last message are at least 2 days old.
                        if(moment(lastMessage.createdAt) < moment().subtract(2, 'days')){

                            // If condition is true, delete the channel, then...
                            //onsole.log(`Deleting channel ${channel.name}`);
                            channel.delete().then(channel => {

                                //Search for the respective channel role.
                                channelRole = channel.guild.roles.find(role => {
                                    return role.name.replace(/ /g, '-').toUpperCase() === channel.name.toUpperCase();
                                });

                                //And delete it role.
                                //console.log(`Deleting role ${channelRole.name}`);
                                channelRole.delete().then(role => console.log(role.name + ' deleted.')).catch(err => console.log('error on deleting role -> ', err))
                            }).catch(err => {
                                //console.log('Error on deleting channel ->', err)
                            })
                        }
                    }
                ).catch(err => {
                    //console.log(err)
                })}
            })
        } catch (e) {
                //console.log(e);
        }

    });

}
