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

        const permissions = ["ADD_PERMISSION", "DELETE_PERMISSION"]
        const active = true
        const tmp = "626265115151747841511"

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

    async forgot(req, res) {
        const {
            email
        } = req.body

        if (!email) {
            return {
                status: "error",
                message: "Merci de spécifier votre email"
            }
        }

        const user = await this.users.findOne({ email })

        if (!user) {
            return {
                status: "error",
                message: "Merci de vous inscrires"
            }
        }

        const tmp = Math.floor(Math.random() * (500 - 10 + 1)) + 10;

        Promise.all([
            this.users.updateOne({
                "email": email
            }, {
                $set: {
                    "tmp": tmp
                }
            }, {
                upsert: true
            }),
            this.mail.send(email, "Mot de passe oublié", `<h1> Mot de passe oubliée </h1> <br> <p> ${tmp} </p>`)
        ])

        return {
            status: "success",
            message: "Vous venez de recevoir un code de vérification par mail"
        }
    }

    async recovery(req, res) {
        const {
            tmp,
            email,
            password
        } = req.body

        if (!tmp) {
            return {
                status: "error",
                message: "Merci de renseigner votre code de vérification"
            }
        }

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

        if (tmp != user.tmp) {
            return {
                status: "error",
                message: "Mauvais code de vérification"
            }
        }

        Promise.all([
            this.users.updateOne({
                "email": email
            }, {
                $set: {
                    "tmp": "",
                    "password": (await argon2.hash(password))
                }
            }, {
                upsert: true
            }),
            this.mail.send(email, "Changement de mot de passe", "Vous venez de faire un changement de mot de passe, si ce n'est pas vous, signalez le au superadmin !")
        ])

        return {
            status: "success",
            message: "Mot de passe changé"
        }
    }
}