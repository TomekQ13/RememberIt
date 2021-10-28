class emailVerificationEmail {
    constructor(emailVerificationLink) {
        this.emailVerificationLink = emailVerificationLink
    }
    static subject = 'Email verification'
    get text() {         
        return `
        Hi,
        
        An account with this email was created at www.neverforgetit.net. If you want to verify this email address click the link: ${this.emailVerificationLink}.

        If you did not create the account someone must have done it using your email.
        You do not have to take any action and the email will be deleted from the database after 30 days if you do not verify it by clicking in the link.

        Best regards
        Never forget it team
        `
    }
    get html() { 
        return `
        <p>Hi,<p>
        
        <p>An account with this email was created at www.neverforgetit.net. If you want to verify this email address click the link: <a href="${this.emailVerificationLink}">Verify email</a></p>

        <p>If you did not create the account someone must have done it using your email.</br>
        You do not have to take any action and the email will be deleted from the database after 30 days if you do not verify it by clicking in the link.</p>

        <p>
        Best regards<br>
        Never forget it team
        </p>
        `    
    }
}

module.exports = emailVerificationEmail