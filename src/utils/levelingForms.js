module.exports = { 
    calculateLevel: (exp) => {
        return Math.floor(Math.pow(exp, 1/3))
    }
}