import { PrismaClient } from '../prisma/generated/client';
import { Contact, ContactInsert, LinkPrecedence } from './types';

export class Database {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findContactsByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    if (!email && !phoneNumber) {
      return [];
    }

    const whereConditions: any[] = [];
    
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

  async findAllLinkedContacts(primaryId: number): Promise<Contact[]> {
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

  async insertContact(contact: ContactInsert): Promise<number> {
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

  async updateContactToPrimary(contactId: number, linkedId: number): Promise<void> {
    await this.prisma.contact.update({
      where: { id: contactId },
      data: {
        linkedId: linkedId,
        linkPrecedence: LinkPrecedence.secondary,
        updatedAt: new Date()
      }
    });
  }

  async getContactById(id: number): Promise<Contact | null> {
    return await this.prisma.contact.findFirst({
      where: {
        AND: [
          { id },
          { deletedAt: null }
        ]
      }
    });
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}