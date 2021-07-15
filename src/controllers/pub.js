const jwt = require('jsonwebtoken')
const {Env} = require("../env/env");

exports.Pub = class Pub {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.pub   = db.collection('pub')
        this.mail  = mail
        this.env = new Env()
    }

    async create(req, res) {
        const {
            name,
            price,
            priority,
            link,
            image,
            token
        } = req.body

        if (!name) {
            return {
                status: "error",
                message: "Merci de spécifier votre nom"
            }
        }

        if (!price) {
            return {
                status: "error",
                message: "Merci de spécifier le prix de votre publicité"
            }
        }

        if (!priority) {
            return {
                status: "error",
                message: "Merci de spécifier la priorité de la publicité"
            }
        }

        if (!link) {
            return {
                status: "error",
                message: "Merci de spécifier le lien de redirection de votre image"
            }
        }

        if (!image) {
            return {
                status: "error",
                message: "Merci de spécifier le nom de votre image"
            }
        }

        try {
            const { email } = await jwt.verify(token, (await this.env.get("SECRET")))

            const user = await this.users.findOne({ email })

            for (const permission of user.permissions) {
                if (permission === "CREATE_PUB") {
                    this.pub.insertOne({
                        name,
                        price,
                        priority,
                        link,
                        image
                    })

                    return {
                        status: "success",
                        message: "Publicité créer avec succès"
                    }
                }
            }

            return {
                status: "error",
                message: "Vous n'avez pas la permission de créer de publicité !"
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