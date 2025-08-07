import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', (req, res, next) => {
  passport.authenticate('register', (err, user, info) => {
    if (err) return res.status(500).send({ status: 'error', message: err.message });
    if (!user) return res.status(400).send({ status: 'error', message: info.message });
    const userData = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      role: user.role,
    };
    res.status(201).send({ status: 'success', message: 'Usuario registrado con éxito', user: userData });
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {
    if (err) return res.status(500).send({ status: 'error', message: err.message });
    if (!user) return res.status(401).send({ status: 'error', message: info.message });

    req.login(user, { session: false }, (err) => {
      if (err) return res.status(500).send({ status: 'error', message: err.message });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'secret_jwt_key',
        { expiresIn: '1h' }
      );

      const userData = {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        role: user.role,
      };

      return res.send({
        status: 'success',
        message: 'Login exitoso',
        token,
        user: userData
      });
    });
  })(req, res, next);
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { password, __v, ...safeUser } = req.user.toObject();

  res.send({
    status: 'success',
    user: safeUser,
  });
});

// Logout con sesión
router.post('/logout', async (req, res) => {
  try {
    await req.logout();
    req.session?.destroy(err => {
      if (err) return res.status(500).send({ status: 'error', message: 'Error al cerrar sesión' });
      res.send({ status: 'success', message: 'Sesión cerrada' });
    });
  } catch (err) {
    res.status(500).send({ status: 'error', message: 'Error al cerrar sesión' });
  }
});

router.get('/token-test', (req, res) => {
  const token = jwt.sign(
    { id: 'test-id', email: 'test@example.com', role: 'tester' },
    process.env.JWT_SECRET || 'secret_jwt_key',
    { expiresIn: '1h' }
  );

  const data = {
    status: 'success',
    message: 'Ruta de prueba del token',
    token,
    user: {
      id: 'test-id',
      email: 'test@example.com',
      role: 'tester'
    }
  };


  res.send(data); 
});

export default router;
