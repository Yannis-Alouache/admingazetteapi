const fastify = require('fastify')
const {
    Env
} = require('../env/env')
const {
    Auth
} = require("../controllers/auth")

exports.Routers = class Routers {
    constructor() {
        this.server = fastify()
        this.env = new Env()

        this.server.register(require('fastify-cors'), {
            origin: (origin, cb) => {
                cb(null, true)
                return
            }
        })
    }

    async init(db, mail) {
        this.auth = new Auth(db, mail)
    }

    handle() {
        this.server.post('/register', this.auth.register.bind(this.auth))
        this.server.post('/login', this.auth.login.bind(this.auth))
        this.server.post('/forgot', this.auth.forgot.bind(this.auth))
        this.server.post('/recovery', this.auth.recovery.bind(this.auth))


    }

    listen() {
        this.env.get("PORT")
            .then(port => this.server.listen(port, () => console.log(`Listening on port ${port}`)))
            .catch(console.error)
    }
}