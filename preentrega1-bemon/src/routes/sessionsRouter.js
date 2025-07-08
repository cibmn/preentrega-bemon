import { Router } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../dao/models/userModel.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).send({ status: 'error', message: 'Faltan datos obligatorios' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).send({ status: 'error', message: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).send({ status: 'success', message: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: 'error', message: 'Faltan datos' });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(401).send({ status: 'error', message: 'Usuario o contraseña incorrectos' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).send({ status: 'error', message: 'Usuario o contraseña incorrectos' });

    req.session.user = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      role: user.role,
      cart: user.cart
    };

    res.send({ status: 'success', message: 'Login exitoso', payload: req.session.user });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send({ status: 'error', message: 'Error al cerrar sesión' });
    res.send({ status: 'success', message: 'Sesión cerrada' });
  });
});

export default router;
