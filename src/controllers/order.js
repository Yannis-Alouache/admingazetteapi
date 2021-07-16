const {Env} = require("../env/env");
const jwt = require('jsonwebtoken')
exports.Order = class Order {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.orders = db.collection('orders')
        this.mail = mail
        this.env = new Env()
    }

    async create(req, res) {
        const {
            token,
            name,
            client,
            data
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        if (!name) {
            return {
                status: "error",
                message: "Merci de spécifier le nom de la facture"
            }
        }

        if (!client) {
            return {
                status: "error",
                message: "Merci de spécifiez le nom du client"
            }
        }

        if (!data) {
            return {
                status: "error",
                message: "Merci de spécifiez vos données de facture"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))
            const user = await this.users.findOne({email: decoded.email})

            for (const p of user.permissions) {
                if (p === "CREATE_ORDER") {
                    Promise.all([
                        this.orders.insertOne({
                            author: decoded.email,
                            name,
                            client,
                            data
                        }),
                        this.mail.send(decoded.email, "Facture crée", "<p> La facture a bien été créer </p>")
                    ])

                    return {
                        status: "success",
                        message: "Facture crée !"
                    }
                }
            }

            return {
                status: "error",
                message: "Vous n'avez pas la permission de faire cela !"
            }
        } catch (e) {
            return {
                status: "error",
                message: e
            }
        }
    }

    async generate(req, res) {

    }

    async delete(req, res) {
        const {
            token,
            name
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        if (!name) {
            return {
                status: "error",
                message: "Merci de spécifier le nom de la publicité"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))
            const user = await this.users.findOne({email: decoded.email})

            for (const p of user.permissions) {
                if (p === "DELETE_PUB") {
                    Promise.all([
                        this.mail.send(decoded.email, "Suppression une facture", "<p> Facture supprimé </p>"),
                        this.orders.deleteOne({name})
                    ])
                    return {
                        status: "success",
                        message: "Facture supprimé !"
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

    async get(req, res) {
        const {
            token,
            name
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        if (!name) {
            return {
                status: "error",
                message: "Merci de spécifiez le nom de la facture"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))
            const user = await this.users.findOne({email: decoded.email})

            for (const p of user.permissions) {
                if (p === "GET_ALL_ORDERS") {
                    const orders = await this.orders.findOne({ name })

                    return {
                        status: "success",
                        data: {
                            orders
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

    async getAll(req, res) {
        const {
            token
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))
            const user = await this.users.findOne({email: decoded.email})

            for (const p of user.permissions) {
                if (p === "GET_ALL_ORDERS") {
                    const orders = await this.orders.find({}).toArray()

                    return {
                        status: "success",
                        data: {
                            orders
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