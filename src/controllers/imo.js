const { Env } = require('../env/env');
const { ResponseType, PermissionType } = require('../utils/type')
const jwt = require('jsonwebtoken')
const { uuid } = require('uuid');

exports.Imo = class Imo {
    constructor (db, mail) {
        this.users = db.collection('users')
        this.imo = db.collection('imo')
        this.mail = mail
        this.env = new Env()
    }

    async create(req, res) {
        const {
            token,
            name,
            link,
            city,
            roomnb,
            size,
            type,
            description,
            begindate,
            enddate,
            price,
        } = req.body
        
        if (!req.raw.files) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!req.raw.files.image.mimetype.includes("image")) {
            return {
                status: "error",
                type: ResponseType.NOT_IMG
            }
        }

        const image = req.raw.files.image

        if (!token) {
            return {
                status: "error",
                type: ResponseType.TOKEN_MISSING
            }
        }

        if (!name) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!link) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!city) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!roomnb) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!size) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!name) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!type) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!description) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!begindate) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!enddate) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!price) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!image) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))
            const me = await this.users.findOne({email: decoded.email})
            
            for (const p of me.permissions) {
                if (p === PermissionType.CREATE_IMO) {
                    Promise.all([
                        this.imo.insertOne({
                            author: decoded.email,
                            name,
                            link,
                            city,
                            roomnb,
                            size,
                            type,
                            description,
                            begindate,
                            enddate,
                            price,
                            image: image.name,
                            id: uuid.v4()
                        }),
                        this.mail.send(decoded.email, "Création d'une annonce Immobilière", "<h1> Annonce Crée </h1>"),
                        fs.writeFile(`${__dirname}/uploads/${image.name}`, image.data)
                    ])

                    return {
                        status: "success",
                        type: ResponseType.SUCCESS
                    }
                }
            }

            return {
                status: "error",
                type: ResponseType.PERMISSION_ERROR
            }
        } catch (e) {
            console.log(e)
            return {
                status: "error",
                type: ResponseType.ERROR
            }
        }
    }

    async delete(req, res) {
        const {
            token,
            id
        } = req.body

        if (!token) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!id) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            const me = await this.users.findOne({email: decoded.email})

            for (const p of me.permissions) {
                if (p === PermissionType.DELETE_IMO) {
                    Promise.all([
                        this.mail.send(decoded.email, "Suppresion d'une annonce", "<h1> Annonce supprimé </h1>"),
                        this.imo.deleteOne({
                            id
                        })
                    ])

                    return {
                        status: "success",
                        type: ResponseType.SUCCESS
                    }
                }
            }

            return {
                status: "error",
                type: ResponseType.PERMISSION_ERROR
            }
        } catch (e) {
            return {
                status: "error",
                type: ResponseType.ERROR
            }
        }
    }
}