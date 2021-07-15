const {Env} = require("../env/env")
const jwt = require('jsonwebtoken')

exports.Permission = class Permission {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail = mail
        this.env = new Env()
    }

    async add(req, res) {
        const {
            token,
            email
        } = req.body


    }

    async delete(req, res) {
        const {
            token,
            email
        } = req.body
    }
}