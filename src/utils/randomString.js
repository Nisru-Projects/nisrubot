module.exports = (size) => {
    return Math.random().toString(36).substr(2, size)
}