import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error';
import { authenticate } from './middleware/auth';
import authRoutes from './routes/auth';
import assistantsRouter from './routes/assistants';
import whisperTemplatesRouter from './routes/whisperTemplates';
import livekitRouter from './routes/livekit.routes';
import openRouterRoutes from './routes/openrouter.routes';
import voicesRouter from './routes/voices.routes';

// Load environment variables
dotenv.config();

console.log('Starting server initialization...');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
console.log('Setting up middleware...');
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
console.log('Setting up routes...');
app.use('/api/auth', authRoutes);
app.use('/api/assistants', assistantsRouter);
app.use('/api/whisper-templates', whisperTemplatesRouter);
app.use('/api/livekit', livekitRouter);
app.use('/api/openrouter', openRouterRoutes);
app.use('/api', voicesRouter); // Mount at /api since routes include /voices prefix

// Error handling
console.log('Setting up error handling...');
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
