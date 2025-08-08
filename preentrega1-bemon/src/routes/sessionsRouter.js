// src/routes/sessionsRouter.js
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import cartDBManager from '../dao/cartDBManager.js';
import userService from '../dao/userService.js';

const router = Router();

router.post('/register', (req, res, next) => {
  passport.authenticate('register', async (err, user, info) => {
    try {
      if (err) return res.status(500).send({ status: 'error', message: err.message });
      if (!user) return res.status(400).send({ status: 'error', message: info.message });

      // Crear carrito para el usuario
      const cart = await cartDBManager.createCart(user._id);

      // Guardar el ID del carrito en el usuario (se asume userService tiene updateUser)
      user.cartId = cart.id;
      await userService.updateUser(user._id, { cartId: cart.id });

      const userData = {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        role: user.role,
        cartId: cart.id
      };

      return res.status(201).send({ status: 'success', message: 'Usuario registrado con éxito', user: userData });
    } catch (error) {
      return res.status(500).send({ status: 'error', message: error.message });
    }
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err) return res.status(500).send({ status: 'error', message: err.message });
      if (!user) return res.status(401).send({ status: 'error', message: info.message });

      req.login(user, { session: false }, async (err) => {
        if (err) return res.status(500).send({ status: 'error', message: err.message });

        // Obtener carrito asociado al usuario
        let cart = await cartDBManager.getCartByUserId(user._id);
        if (!cart) {
          cart = await cartDBManager.createCart(user._id);
          // Actualizar usuario con nuevo carrito si no tenía
          await userService.updateUser(user._id, { cartId: cart.id });
        }

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
          cartId: cart.id
        };

        return res.send({
          status: 'success',
          message: 'Login exitoso',
          token,
          user: userData
        });
      });
    } catch (error) {
      return res.status(500).send({ status: 'error', message: error.message });
    }
  })(req, res, next);
});

export default router;
