import { Database } from './database';
import { Contact, IdentifyRequest, IdentifyResponse, LinkPrecedence } from './types';

export class ContactService {
  constructor(private db: Database) {}

  async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = request;

    const existingContacts = await this.db.findContactsByEmailOrPhone(email, phoneNumber);

    if (existingContacts.length === 0) {
      const newContactId = await this.db.insertContact({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: null,
        linkPrecedence: LinkPrecedence.primary
      });

      return {
        contact: {
          primaryContatctId: newContactId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: []
        }
      };
    }

    const primaryContacts = existingContacts.filter(c => c.linkPrecedence === LinkPrecedence.primary);
    
    if (primaryContacts.length === 0) {
      const linkedContact = existingContacts[0];
      const primaryId = linkedContact.linkedId;
      if (!primaryId) {
        throw new Error('Primary contact not found, Invalid data');
      }
      return await this.buildResponse(primaryId, request);
    }

    if (primaryContacts.length === 1) {
      const primaryContact = primaryContacts[0];
      
      const needsNewContact = this.needsNewSecondaryContact(existingContacts, email, phoneNumber);
      
      if (needsNewContact) {
        await this.db.insertContact({
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: primaryContact.id,
          linkPrecedence: LinkPrecedence.secondary
        });
      }

      return await this.buildResponse(primaryContact.id, request);
    }

    // Data not consistent, so we need to sort the primaries by createdAt
    const sortedPrimaries = primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const mainPrimary = sortedPrimaries[0];
    const secondariesToUpdate = sortedPrimaries.slice(1);

    for (const contact of secondariesToUpdate) {
      await this.db.updateContactToPrimary(contact.id, mainPrimary.id);
    }

    const allLinkedContacts = await this.db.findAllLinkedContacts(mainPrimary.id);
    const needsNewContact = this.needsNewSecondaryContact(allLinkedContacts, email, phoneNumber);
    
    if (needsNewContact) {
      await this.db.insertContact({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: mainPrimary.id,
        linkPrecedence: LinkPrecedence.secondary
      });
    }

    return await this.buildResponse(mainPrimary.id, request);
  }

  private needsNewSecondaryContact(existingContacts: Contact[], email?: string, phoneNumber?: string): boolean {
    const exactMatch = existingContacts.some(contact => 
      contact.email === (email || null) && contact.phoneNumber === (phoneNumber || null)
    );

    if (exactMatch) {
      return false;
    }

    const hasNewEmail = email && !existingContacts.some(c => c.email === email);
    const hasNewPhone = phoneNumber && !existingContacts.some(c => c.phoneNumber === phoneNumber);

    return Boolean(hasNewEmail || hasNewPhone);
  }

  private async buildResponse(primaryId: number, request: IdentifyRequest): Promise<IdentifyResponse> {
    const allLinkedContacts = await this.db.findAllLinkedContacts(primaryId);
    
    const primaryContact = allLinkedContacts.find(c => c.linkPrecedence === LinkPrecedence.primary);
    if (!primaryContact) {
      throw new Error('Primary contact not found, Invalid data');
    }
    const secondaryContacts = allLinkedContacts.filter(c => c.linkPrecedence === LinkPrecedence.secondary);

    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();

    if (primaryContact.email) emails.add(primaryContact.email);
    if (primaryContact.phoneNumber) phoneNumbers.add(primaryContact.phoneNumber);

    secondaryContacts.forEach(contact => {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
    });

    return {
      contact: {
        primaryContatctId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds: secondaryContacts.map(c => c.id)
      }
    };
  }
} 