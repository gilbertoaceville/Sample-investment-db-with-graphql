const userResolver = require('./user')
const  investmentResolve = require('./investment')
module.exports = {
...userResolver,
...investmentResolve
}