exports.Auth = class Auth {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail  = mail
    }

    async register(req, res) {

    }
}