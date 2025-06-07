import { Contact, ContactInsert } from './types';
export declare class Database {
    private prisma;
    constructor();
    findContactsByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]>;
    findAllLinkedContacts(primaryId: number): Promise<Contact[]>;
    insertContact(contact: ContactInsert): Promise<number>;
    updateContactToPrimary(contactId: number, linkedId: number): Promise<void>;
    getContactById(id: number): Promise<Contact | null>;
    close(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map