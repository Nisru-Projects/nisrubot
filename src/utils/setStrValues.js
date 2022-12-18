module.exports = (message, vars) => {
    for (const key in vars) {
        message = message.replace(`{${key}}`, vars[key])
    }
    return message
}