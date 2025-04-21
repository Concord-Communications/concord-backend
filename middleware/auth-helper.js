import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
    const token = req.headers['x-auth-token'];
    if (!token) {return res.status(401).send("MY PRECIOUS! (no token provided)") }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next();
    } catch (exception) {
        return res.status(400).send("Invalid token. What has it got in its nasty little pocketses.")
    }
}
