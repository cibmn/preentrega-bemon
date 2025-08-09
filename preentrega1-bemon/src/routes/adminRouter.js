import { Router } from 'express';
import { jwtAuth } from '../middlewares/jwtAuth.js';
import { authRole } from '../middlewares/roleAuth.js';

const router = Router();

router.get('/dashboard', jwtAuth, authRole('admin'), (req, res) => {
  res.send({ status: 'success', message: 'Bienvenido Admin!' });
});

export default router;
