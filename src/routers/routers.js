const fastify = require('fastify')
const {Pub} = require("../controllers/pub");
const {User} = require("../controllers/user");
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
            }
        })
    }

    async init(db, mail) {
        this.auth = new Auth(db, mail)
        this.user = new User(db, mail)
        this.pub  = new Pub(db, mail)
    }

    handle() {
        this.server.post('/api/auth/register', this.auth.register.bind(this.auth))
        this.server.post('/api/auth/login', this.auth.login.bind(this.auth))
        this.server.post('/api/auth/forgot', this.auth.forgot.bind(this.auth))
        this.server.post('/api/auth/recovery', this.auth.recovery.bind(this.auth))

        this.server.post('/api/user/change', this.user.change.bind(this.user))
        this.server.post('/api/user/delete', this.user.delete.bind(this.user))
        this.server.post('/api/user/get', this.user.get.bind(this.user))
    }

    listen() {
        this.env.get("PORT")
            .then(port => this.server.listen(port, () => console.log(`Listening on port ${port}`)))
            .catch(console.error)
    }
}