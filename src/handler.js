const config = require('../config.js')
const { isWhitelist } = require('./whitelist.js')

/**
 * Handles incoming messages and forwards them to the appropriate plugins.
 *
 * This asynchronous function is intended to process messages received by the bot.
 * It will manage and route the messages to the relevant plugins for further handling.
 * The actual implementation of how messages are processed and forwarded to plugins 
 * should be completed within this function.
 *
 * @param {Object} m - The message object that contains the details of the incoming message.
 * @param {Array} plugins - An array of plugin functions or objects that will handle the message.
 */
async function message(log, m, plugins) {
    if (!isWhitelist(m.sender.user)) return
    
    for (let plugin of plugins) {
		plugins = plugins.filter(x => x != plugin);
		try {
			plugin = require(plugin);
			plugins.push(plugin);
		} catch (e) {
			log.error(`Failed loading plugin: ${e}`);
		}
	}

    plugins = plugins.filter(p => !!Object.keys(p).length);
    const administrator = !!config.administrator.find(x => x == m.sender.user);

    for (let plugin of plugins) {
        if (!m.prefix) return;
        if (![plugin?.name, ...plugin?.alias].includes(m.cmd)) continue;
        bot.sendPresenceUpdate('composing', m.chat.toString());
        if (plugin.admin && !administrator) return m.reply('⚠️ This feature only for administrator!');
        try {
            plugin.run(m, plugins)
        } catch (e) {
            log.error(`Error executing plugin: ${e}`)
        }
    }
}

module.exports = { message }