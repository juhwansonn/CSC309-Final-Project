require('dotenv').config();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const tokenSecret = process.env.JWT_SECRET;

const enforceAuthenticatedUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "authorization header required" });
    }

    const [, tokenValue] = authHeader.split(' ');
    if (!tokenValue) {
        return res.status(401).json({ message: "bearer token segment missing" });
    }

    try {
        const payload = jwt.verify(tokenValue, tokenSecret);

        const activeUser = await prisma.user.findUnique({
            where: { utorid: payload.username }
        });

        if (!activeUser) {
            return res.status(401).json({ message: "account not recognized" })
        }

        if (activeUser.role) {
            activeUser.role = activeUser.role.toLowerCase();
        }

        req.user = activeUser;
        next();
    } catch(e) {
        return res.status(401).json({ message: "token signature invalid" });
    }
}

module.exports = enforceAuthenticatedUser;
