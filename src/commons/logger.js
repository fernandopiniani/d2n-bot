const chalk = require('chalk')
const moment = require('moment')

const log = level => (...args) => {
    const [ firstArgs, ...rest ] = args
    return console.log(`[d2nbot] ${moment().format('YYYY-MM-DD')} ${level} - ${firstArgs}`, ...rest)
}

module.exports = {
    info: log(chalk.blue('INFO')),
    debug: log('DEBUG'),
    warn: log(chalk.yellow('WARN')),
    error: log(chalk.red('ERROR'))
}