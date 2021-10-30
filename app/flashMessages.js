class flashMsg {
    static insufficientPrivileges = {
        'htmlClass': 'error',
        'msg': 'Insufficient privileges to perform this action'
    }
    
    static generalError = {
        'htmlClass': 'error',
        'msg': 'There was an error. Please try again.'
    }

    static createdSuccessfully = {
        htmlClass: 'success',
        msg(object) { return `${object} created successfully` }

    }
}

module.exports = flashMsg


