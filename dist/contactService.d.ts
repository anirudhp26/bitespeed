import { Database } from './database';
import { IdentifyRequest, IdentifyResponse } from './types';
export declare class ContactService {
    private db;
    constructor(db: Database);
    identify(request: IdentifyRequest): Promise<IdentifyResponse>;
    private needsNewSecondaryContact;
    private buildResponse;
}
//# sourceMappingURL=contactService.d.ts.map