const {Env} = require("../env/env");
const jwt = require('jsonwebtoken')

exports.Contact = class Contact {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail = mail
        this.env = new Env()
    }

    async add(req, res) {
        const {
            token,
            userEmail,
            email,
            firstname,
            lastname,
            role,
            tel
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        if (!userEmail) {
            return {
                status: "error",
                message: "Merci de renseigner le mail de l'utilisateur"
            }
        }

        if (!email) {
            return {
                status: "error",
                message: "Merci de renseigner le mail du contact"
            }
        }

        if (!firstname) {
            return {
                status: "error",
                message: "Merci de renseigner le prénom du contact"
            }
        }

        if (!lastname) {
            return {
                status: "error",
                message: "Merci de renseigner le nom du contact"
            }
        }

        if (!role) {
            return {
                status: "error",
                message: "Merci de renseigner la fonction du contact"
            }
        }

        if (!tel) {
            return {
                status: "error",
                message: "Merci de renseigner le téléphone du contact"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const user = await this.users.findOne({email: decoded.email})

                for (const p of user.permissions) {
                    if (p === "ADD_CONTACT") {
                        user.contacts.push({email, firstname, lastname, role, tel})

                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "contacts": user.contacts
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(decoded.email, "Ajout de contact", `<h1> Un contact vous a été ajouter </p>`)
                        ])
                        return {
                            status: "success",
                            message: "Ajout !"
                        }
                    }
                }
            } else {
                const [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({email: decoded.email}),
                    this.users.findOne({email})
                ])

                for (const p of me.permissions) {
                    if (p === "ADD_CONTACT") {
                        user.contacts.push({email, firstname, lastname, role, tel})

                        Promise.all([
                            this.users.updateOne({
                                "email": email
                            }, {
                                $set: {
                                    "contacts": user.contacts
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(email, "Ajout de contact", `<h1> Un contact vous a été ajouter </p>`)
                        ])
                        return {
                            status: "success",
                            message: "Ajout !"
                        }
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
            email,
            contact
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
                message: "Merci de spécifiez votre email"
            }
        }

        if (!contact) {
            return {
                status: "error",
                message: "Merci de spécifiez votre contact"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const user = await this.users.findOne({ email: decoded.email })

                for (const p of user.permissions) {
                    if (p === "DELETE_CONTACT") {
                        user.contacts = user.contacts.filter(e => e !== contact)
                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "contacts": user.contacts
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(decoded.email, "Suppresion de contact", `<h1> Un contact vous a été ajouter </p>`)
                        ])
                        return {
                            status: "success",
                            message: "Supprimé !"
                        }
                    }
                }
            } else {
                const [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({ email: decoded.email }),
                    this.users.findOne({ email })
                ])

                for (const p of me.permissions) {
                    if (p === "DELETE_CONTACT") {
                        user.contacts = user.contacts.filter(e => e !== contact)
                        Promise.all([
                            this.users.updateOne({
                                "email": email
                            }, {
                                $set: {
                                    "contacts": user.contacts
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(email, "Suppresion de contact", `<h1> Un contact vous a été ajouter </p>`)
                        ])
                        return {
                            status: "success",
                            message: "Supprimé !"
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

    async get(req, res) {
        const {
            token,
            email,
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez !"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const user = await this.users.findOne({ email: decoded.email })

                for (const p of user.permissions) {
                    if (p === "GET_CONTACT") {
                        return {
                            status: "success",
                            data: {
                                contacts: user.contacts
                            }
                        }
                    }
                }
            } else {
                const [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({ email: decoded.email }),
                    this.users.findOne({ email })
                ])

                for (const p of me.permissions) {
                    if (p === "GET_CONTACT") {
                        return {
                            status: "success",
                            data: {
                                contacts: user.contacts
                            }
                        }
                    }
                }
            }

            return {
                status: "error",
                message: "Vous n'avez pas la permission"
            }
        }
         catch (e) {
            return {
                status: "error",
                message: e
            }
        }
    }
}

