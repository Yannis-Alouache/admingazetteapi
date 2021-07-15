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
            email,
            permission
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        if (!permission) {
            return {
                status: "error",
                message: "Merci de spécifiez une permission"
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const me = await this.users.findOne({email: decoded.email})

                for (const p of me.permissions) {
                    if (p === "ADD_PERMISSION") {
                        me.permissions.push(permission)

                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "permissions": me.permissions,
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(decoded.email, "Mis à jour des permissions", `Vos permissions ont étaient mis à jour !`)
                        ])

                        return {
                            status: "success",
                            message: "Permissions mis à jour !"
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
                    if (p === "ADD_PERMISSION") {
                        user.permissions.push(permission)
                        Promise.all([
                            this.users.updateOne({
                                "email": email
                            }, {
                                $set: {
                                    "permissions": user.permissions,
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(email, "Mis à jour des permissions", `Vos permissions ont étaient mis à jour !`)
                        ])
                        return {
                            status: "success",
                            message: "Permission mis à jour !"
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

    async delete(req, res) {
        const {
            token,
            email,
            permission
        } = req.body

        if (!token) {
            return {
                status: "error",
                message: "Merci de vous connectez"
            }
        }

        if (!permission) {
            return {
                status: "error",
                message: "Merci de spécifiez la permission"
            }
        }

        try {
            const decoded = jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                let user = await this.users.findOne({email: decoded.email})
                for (const p of user.permissions) {
                    if (p === "DELETE_PERMISSION") {
                        user.permissions = user.permissions.filter(e => e !== permission)
                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "permissions": user.permissions,
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(decoded.email, "Supression d'une permissions", `Vos permissions ont étaient mis à jour !`)
                        ])
                        return {
                            status: "success",
                            message: "Permission supprimé"
                        }
                    }
                }
            } else {
                let [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({email: decoded.email}),
                    this.users.findOne({email})
                ])

                for (const p of me.permissions) {
                    if (p === "DELETE_PERMISSION") {
                        user.permissions = user.permissions.filter(e => e !== permission)
                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "permissions": user.permissions,
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(email, "Supression d'une permissions", `Vos permissions ont étaient mis à jour !`)
                        ])
                        return {
                            status: "success",
                            message: "Permission supprimé"
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
            email
        } = req.body


    }
}