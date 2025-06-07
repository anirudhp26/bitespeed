"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const contactService_1 = require("./contactService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const database = new database_1.Database();
const contactService = new contactService_1.ContactService(database);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Bitespeed Identity Reconciliation Service is running' });
});
app.post('/identify', async (req, res) => {
    try {
        const request = req.body;
        if (!request.email && !request.phoneNumber) {
            return res.status(400).json({
                error: 'At least one of email or phoneNumber must be provided'
            });
        }
        const response = await contactService.identify(request);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error processing identify request:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Identify endpoint: http://localhost:${PORT}/identify`);
});
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await database.close();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await database.close();
    process.exit(0);
});
//# sourceMappingURL=index.js.map