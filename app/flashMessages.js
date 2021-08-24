const flash = require('express-flash');

class flashMsg {
    insufficientPrivileges = (req) => {
        req.flash('error', 'Insufficient privileges to perform this action')
    }
    
    dbError = function dbError(req) {
        req.flash('error', 'There was an error. Please try again.')
    }

}

module.exports = flashMsg


