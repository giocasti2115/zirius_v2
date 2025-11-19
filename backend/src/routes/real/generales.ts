import { Router } from 'express';

const router = Router();

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Generales OK' });
});

router.get('/usuarios', (req, res) => {
  res.json({ success: true, data: [], message: 'Usuarios endpoint OK' });
});

export default router;
