const jwt = require('jsonwebtoken')
const {Env} = require("../env/env");
const fs = require('fs')

exports.Pub = class Pub {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.pub = db.collection('pub')
        this.mail = mail
        this.env = new Env()
    }

    async create(req, res) {
        const {
            token,
            name,
            type,
            link, 
            
        } = req.body

        const image = req.raw.files.image

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez !"
            }
        }

        if (!name) {
            return {
                status: "error",
                message: "Merci de spécifiez le nom de la pub"
            }
        }

        if (!price) {
            return {
                status: "error",
                message: "Merci de spécifiez le prix de votre pub"
            }
        }

        if (!priority) {
            return {
                status: "error",
                message: "Merci de spécifiez la priorité de la pub"
            }
        }

        if (!link) {
            return {
                status: "error",
                message: "Merci de spécifiez le lien de redirection de votre publicité"
            }
        }

        if (!image) {
            return {
                status: "error",
                message: "Merci de renseignez une image"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            const me = await this.users.findOne({email: decoded.email})

            for (const p of me.permissions) {
                if (p === "CREATE_PUB") {

                    Promise.all([
                        this.pub.insertOne({
                            author: decoded.email,
                            name,
                            price,
                            priority,
                            link,
                            image: image.name
                        }),
                        this.mail.send(decoded.email, "Création d'une pub", "<h1> Publicité crée </h1>"),
                        fs.writeFile(`${__dirname}/uploads/${image.name}`, image.data, (e) => {
                        })
                    ])

                    return {
                        status: "success",
                        message: "Publicité crée"
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
                message: "Merci de spécifiez votre nom"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            const me = await this.users.findOne({email: decoded.email})

            for (const p of me.permissions) {
                if (p === "DELETE_PUB") {
                    Promise.all([
                        this.mail.send(decoded.email, "Suppresion d'une pub", "<h1> Publicité supprimé </h1>"),
                        this.pub.deleteOne({
                            name
                        })
                    ])

                    return {
                        status: "success",
                        message: "Publicité supprimé !"
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

            const me = await this.users.findOne({email: decoded.email})

            for (const p of me.permissions) {
                if (p === "GET_PUB") {
                    const pub = await this.pub.find({}).toArray()
                    return {
                        status: "success",
                        data: {
                            pub
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