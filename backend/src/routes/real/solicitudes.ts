import { Router } from 'express';

const router = Router();

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Solicitudes OK' });
});

export default router;
