const jwt = require('jsonwebtoken')
const argon2 = require('argon2')
const {Env} = require("../env/env");

exports.Auth = class Auth {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail  = mail
        this.env = new Env()
    }

    async register(req, res) {
        const {
            email,
            firstname,
            lastname,
            password,
            enterprise,
            contacts,
            address,
            zipcode
        } = req.body

        const permissions = []
        const active = true
        const tmp = ""

        if (!email) {
            return {
                status: "error",
                message: "Merci de renseigner votre email"
            }
        }

        if (!firstname) {
            return {
                status: "error",
                message: "Merci de renseigner votre prénom"
            }
        }

        if (!lastname) {
            return {
                status: "error",
                message: "Merci de renseigner votre nom"
            }
        }

        if (!password) {
            return {
                status: "error",
                message: "Merci de renseigner votre mot de passe"
            }
        }

        if (!enterprise) {
            return {
                status: "error",
                message: "Merci de renseigner le nom de votre entreprise"
            }
        }

        if (!contacts) {
            return {
                status: "error",
                message: "Merci de renseigner vos contacts"
            }
        }

        if (!address) {
            return {
                status: "error",
                message: "Merci de renseigner votre adresse"
            }
        }

        if (!zipcode) {
            return {
                status: "error",
                message: "Merci de renseigner votre code postal"
            }
        }

        const userExist = await this.users.findOne({ email })

        if (userExist) {
            return {
                status: "error",
                message: "Vous êtes déjà inscrit !"
            }
        }

        Promise.all([
            this.users.insertOne({
                email,
                firstname,
                lastname,
                password: (await argon2.hash(password)),
                enterprise,
                contacts,
                address,
                zipcode,
                permissions,
                active,
                tmp
            }),
            this.mail.send(email, "Inscription réussis !", "<h1> Vous venez de vous inscrires ! </h1>")
        ])

        return {
            status: "success",
            message: "Inscription réussis !"
        }
    }

    async login(req, res) {
        const {
            email,
            password
        } = req.body

        if (!email) {
            return {
                status: "error",
                message: "Merci de renseigner votre email"
            }
        }

        if (!password) {
            return {
                status: "error",
                message: "Merci de renseigner votre mot de passe"
            }
        }

        const user = await this.users.findOne({ email })

        const match = await argon2.verify(user.password, password)

        if (!match) {
            return {
                status: "error",
                message: "Mot de passe incorrecte"
            }
        }

        const token = await jwt.sign({
            email: user.email
        }, (await this.env.get("SECRET")))

        return {
            status: "success",
            token
        }
    }
}