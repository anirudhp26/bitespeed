"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const client_1 = require("../prisma/generated/client");
const types_1 = require("./types");
class Database {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async findContactsByEmailOrPhone(email, phoneNumber) {
        if (!email && !phoneNumber) {
            return [];
        }
        const whereConditions = [];
        if (email) {
            whereConditions.push({ email });
        }
        if (phoneNumber) {
            whereConditions.push({ phoneNumber });
        }
        return await this.prisma.contact.findMany({
            where: {
                AND: [
                    { deletedAt: null },
                    { OR: whereConditions }
                ]
            }
        });
    }
    async findAllLinkedContacts(primaryId) {
        return await this.prisma.contact.findMany({
            where: {
                AND: [
                    { deletedAt: null },
                    {
                        OR: [
                            { id: primaryId },
                            { linkedId: primaryId }
                        ]
                    }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }
    async insertContact(contact) {
        const result = await this.prisma.contact.create({
            data: {
                phoneNumber: contact.phoneNumber,
                email: contact.email,
                linkedId: contact.linkedId,
                linkPrecedence: contact.linkPrecedence,
            }
        });
        return result.id;
    }
    async updateContactToPrimary(contactId, linkedId) {
        await this.prisma.contact.update({
            where: { id: contactId },
            data: {
                linkedId: linkedId,
                linkPrecedence: types_1.LinkPrecedence.secondary,
                updatedAt: new Date()
            }
        });
    }
    async getContactById(id) {
        return await this.prisma.contact.findFirst({
            where: {
                AND: [
                    { id },
                    { deletedAt: null }
                ]
            }
        });
    }
    async close() {
        await this.prisma.$disconnect();
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map