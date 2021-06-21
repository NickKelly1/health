
import { Router } from 'express';

export const _health = Router();

// health check
_health.get('/', (req, res) => res.status(200).json({
  message: 'Okay :)',
  date: new Date().toISOString(),
}));
