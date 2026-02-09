const prisma = require('../database/prisma');

async function create(user) {
    return prisma.user.create({
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.passwordHash,
            role: user.role
        }
    });
}

async function findByEmail(email) {
    return prisma.user.findUnique({
        where: { email }
    });
}

async function findAll() {
    return prisma.user.findMany();
}

module.exports = {
    create,
    findByEmail,
    findAll
};  