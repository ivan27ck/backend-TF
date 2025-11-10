import express from 'express';
import cors, { CorsOptions } from 'cors';
import http from 'http'; // Import http
import { Server } from 'socket.io'; // Import Server from socket.io
import dotenv from 'dotenv'; // Import dotenv
dotenv.config(); // Load environment variables

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import serviceRoutes from './routes/serviceRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import categoryRoutes from './routes/categoryRoutes';
import agreementRoutes from './routes/agreementRoutes';
import simpleMessageRoutes from './routes/simpleMessageRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { prisma } from './utils/prisma';
import { setupSocketIO } from './socket'; // Import the new socket setup

const DEFAULT_ALLOWED_ORIGINS = ['https://trabajofacil.vercel.app'];
const normalizeOrigin = (value: string) => value.replace(/\/$/, '');
const parsedConfiguredOrigins = process.env.FRONTEND_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = (parsedConfiguredOrigins?.length ? parsedConfiguredOrigins : DEFAULT_ALLOWED_ORIGINS).map(
  normalizeOrigin
);

const app = express();
const httpServer = http.createServer(app); // Create HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST']
  }
}); // Initialize Socket.io

// CORS: usa el ORIGIN de tu .env (o permite todo en local)
const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean | string) => void
  ) => {
    const wildcardEnabled = allowedOrigins.includes('*');
    const sanitizedOrigin = origin ? normalizeOrigin(origin) : undefined;
    if (!sanitizedOrigin || wildcardEnabled || allowedOrigins.includes(sanitizedOrigin)) {
      return callback(null, sanitizedOrigin ?? true);
    }
    return callback(new Error('Origen no permitido por CORS'), false);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => res.send('API TrabajoFácil OK'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/simple-messages', simpleMessageRoutes);
app.use('/api/upload', uploadRoutes);

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));

app.get('/api/health', async (_req, res) => {
  try {
    // Simple health check for SQLite
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, message: 'API TrabajoFácil funcionando correctamente' });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 404 + manejador de errores
app.use((_req, res) => res.status(404).json({ message: 'No encontrado' }));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno' });
});

// Setup Socket.io
setupSocketIO(io);

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => { // Listen on httpServer
  console.log(`Backend escuchando en http://localhost:${PORT}`);
  console.log(`Socket.io escuchando en ws://localhost:${PORT}`);
});

export { io }; // Export io to be used elsewhere