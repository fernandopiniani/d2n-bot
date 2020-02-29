/**
 * Register module allows to create an identity control in discord channel based
 * on user's twinoid profile description and user's discord id. If the user achieve
 * to insert
 * @param  {[type]} bot    [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
module.exports = (bot, config) => {

    const name = 'register';

    //TODO: const generateUserToken = (user) => user.

    bot.on('message', msg => {
        const cmdInfo = bot.handleCommand(msg);

        console.log(msg.author);
        if(cmdInfo.cmd != name) return;

        const args = cmdInfo.args;
        if(args[0]){
            const profileURL = args[0];

            https.get(profileURL, (resp) => {
                let data = '';
                // A chunk of data was received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                // The whole response was received. Process data.
                resp.on('end', () => {
                    const html = data.toString();

                    //Get user's name
                    let name = html.match(/tid_icon="0">.*</)[0];
                    name = name.substring(13, name.length - 1);

                    //Get unique key
                    let key = html.match(/d2n-discord-key:.{6}/)[0];
                    key = key.substring(16);

                    msg.channel.send(`I see you here, ${msg.author}. From now on you\'ll be called Citizen ${name}.`);
                });
            }).on("error", (err) => {
                msg.channel.send(`Sorry, ${msg.author}. Can't find you in my book.`);
            });
        }else{
            msg.member.createDM()
            .then(dm => {
                dm.send(`Missing town's name parameter. Try !register https://twinoid.com/user/yourIdHere`);
            });
        }
    });
}
