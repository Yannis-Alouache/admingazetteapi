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

    }
}