import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './database';
import { ContactService } from './contactService';
import { IdentifyRequest } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const database = new Database();
const contactService = new ContactService(database);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bitespeed Identity Reconciliation Service is running' });
});

app.post('/identify', async (req, res) => {
  try {
    const request: IdentifyRequest = req.body;

    if (!request.email && !request.phoneNumber) {
      return res.status(400).json({
        error: 'At least one of email or phoneNumber must be provided'
      });
    }

    const response = await contactService.identify(request);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error processing identify request:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Bitespeed Identity Reconciliation Service is running',
    health: 'OK' 
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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