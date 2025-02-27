import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // For development, accept all requests
  req.user = { id: '1', role: 'user' };
  return next();

  // TODO: Re-enable authentication when ready
  /*
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  */
};
