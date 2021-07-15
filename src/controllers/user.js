const jwt = require('jsonwebtoken')
const {Env} = require("../env/env");

exports.User = class User {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail = mail
        this.env = new Env()
    }

    async change(req, res) {
        const {
            token,
            email,
            firstname,
            lastname,
            address,
            zipcode
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        if (!email) {
            return {
                status: "error",
                message: "Merci de spécifier votre email"
            }
        }

        if (!firstname) {
            return {
                status: "error",
                message: "Merci de spécifier votre prénom"
            }
        }

        if (!lastname) {
            return {
                status: "error",
                message: "Merci de spécifier votre nom"
            }
        }

        if (!address) {
            return {
                status: "error",
                message: "Merci de spécifier votre adresse"
            }
        }

        if (!zipcode) {
            return {
                status: "error",
                message: "Merci de spécifier votre code postal"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (email === decoded.email) {
                Promise.all([
                    this.users.updateOne({
                        "email": email
                    }, {
                        $set: {
                            "firstname": firstname,
                            "lastname": lastname,
                            "address": address,
                            "zipcode": zipcode
                        }
                    }, {
                        upsert: true
                    }),
                    this.mail.send(email, "Changement d'information", `Les informations de votre compte ont bien étaient mis à jour`)
                ])
                return {
                    status: "success",
                    message: "Mis à jour !"
                }
            }

            const user = await this.users.findOne({ email: decoded.email })

            for (const permission of user.permissions) {
                if (permission === "CHANGE_INFORMATION") {
                    Promise.all([
                        this.users.updateOne({
                            "email": email
                        }, {
                            $set: {
                                "firstname": firstname,
                                "lastname": lastname,
                                "address": address,
                                "zipcode": zipcode
                            }
                        }, {
                            upsert: true
                        }),
                        this.mail.send(email, "Changement d'information", `Les informations de votre compte ont bien étaient mis à jour`)
                    ])
                    return {
                        status: "success",
                        message: "Mis à jour !"
                    }
                }
            }

            return {
                status: "error",
                message: "Vous n'avez pas la permission de faire cela"
            }
        } catch (e) {
            return {
                status: "error",
                message: e
            }
        }
    }

    async delete(req, res) {
        const {
            token,
            email
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de spécifier votre token"
            }
        }

        if (!email) {
            return {
                status: "error",
                message: "Merci de spécifier l'email"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            const user = await this.users.findOne({ email: decoded.email })

            for (const permission of user.permissions) {
                if (permission === "DELETE_USER") {
                    Promise.all([
                        this.users.deleteOne({ email }),
                        this.mail.send(email, "Compte supprimé", "Votre compte à étais supprimé")
                    ])

                    return {
                        status: "success",
                        message: "Supprimé !"
                    }
                }
            }

            return {
                status: "error",
                message: "Vous n'avez pas la permission"
            }
        } catch (e) {
            return {
                status: "error",
                message: e
            }
        }
    }

    async get(req, res) {
        const {
            token,
            email
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (email === decoded.email || !email) {
                const {
                    firstname,
                    lastname,
                    email,
                    zipcode,
                    address,
                    contacts,
                    enterprise
                } = await this.users.findOne({ email: decoded.email })
                return {
                    status: "success",
                    data: {
                        firstname,
                        lastname,
                        email,
                        zipcode,
                        address,
                        contacts,
                        enterprise
                    }
                }
            }

            const [user, me] = await Promise.all([
                this.users.findOne({ email }),
                this.users.findOne({ email: decoded.email })
            ])

            for (const permission of me.permissions) {
                if (permission === "GET_USER_INFORMATION") {
                    return {
                        status: "success",
                        data: {
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            zipcode: user.zipcode,
                            address: user.address,
                            contacts: user.contacts,
                            enterprise: user.enterprise
                        }
                    }
                }
            }

            return {
                status: "error",
                message: "Vous n'avez pas la permission"
            }
        } catch (e) {
            return {
                status: "error",
                message: e
            }
        }
    }
}