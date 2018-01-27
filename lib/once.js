module.exports = once

function once (action) {
  let called = false
  let value = null
  let error = null

  return (...args) => {
    if (!called) {
      called = true

      try {
        value = action(...args)
      } catch (err) {
        error = err
      }
    }

    if (error) {
      throw error
    } else {
      return value
    }
  }
}

