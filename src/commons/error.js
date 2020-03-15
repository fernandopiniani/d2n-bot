const logger = require('./logger')

const error = logger => fn => async (...args) => {
  try {
    const result = await fn(...args)
    return result
  } catch (e) {
    logger.error(`${e.message}`)
  }
}

module.exports = {
  errorMiddleware: error(logger)
}
