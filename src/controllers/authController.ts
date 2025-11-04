import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';

export async function register(req: Request, res: Response) {
  const { email, password, name, profession, location, experience } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ message: 'Faltan campos' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email ya registrado' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name, profession, location, experience } });
  const token = signToken({ id: user.id });
  res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Faltan credenciales' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = signToken({ id: user.id });
  res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
}
