require('../config/config')
const jwt = require('jsonwebtoken')


const authorize = (roles = []) => {
    
    return (req, res, next) => {
        // Authenticate
        if (!req.user)
            try {
                
                // Token in Authorization Header
                if (typeof req.headers.authorization === 'string') {
                    req.user = jwt.verify(req.headers.authorization, process.env.TOKEN_SECRET)
                }
                
                // Token not present
                else 
                    return res.status(403).json({ status: 403, message: "Not logged in"})
            } catch (err) {
                console.error(err)
                return res.status(400).json({ status: 500, message: "Internal server error"})
            }
        
        // roles param can be a single role string (e.g. Role.User or 'User') 
        // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
        if (typeof roles === 'string') {
            roles = [roles]
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' })
        }
        
        // authentication and authorization successful
        next()
    }
}

module.exports = authorize