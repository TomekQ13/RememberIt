class passwordResetEmail {
    constructor(name, resetPasswordLink) {
        if (name) {
            this.name = ' ' + name
        } else {
            this.name = ''
        }
        this.resetPasswordLink = resetPasswordLink
    }
    static subject = 'Password reset'
    get text() {         
        return `
        Hi${this.name},
        
        If you need to reset your password click here: ${this.resetPasswordLink}
        If the link does not work copy and paste it into the browser. The link is valid for 60 minutes from the time it has been sent. If the link is no longer valid you can generate a new one.

        If you did not make this request then ignore this email and no changes will be made.

        Best regards
        Never forget it team
        `
    }
    get html() { 
        return `
        <p>Hi${this.name},</p>
        <p>
        If you need to reset your password click here: <a href="${this.resetPasswordLink}">Reset password</a><br>
        If the link does not work copy and paste it into the browser. The link is valid for 60 minutes from the time it has been sent. If the link is no longer valid you can generate a new one.
        </p>
        <p>
        If you did not make this request then ignore this email and no changes will be made.
        </p>
        <p>
        Best regards<br>
        Never forget it team
        </p>
        `        
    }
}



module.exports = passwordResetEmail