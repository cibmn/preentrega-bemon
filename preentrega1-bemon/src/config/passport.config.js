import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import UserModel from '../dao/models/userModel.js';
import { createHash, isValidPassword } from '../utils/hashUtil.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_jwt_key';

// Estrategia para registro
passport.use('register', new LocalStrategy(
  { usernameField: 'email', passReqToCallback: true },
  async (req, email, password, done) => {
    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) return done(null, false, { message: 'Usuario ya existe' });

      const newUser = await UserModel.create({
        ...req.body,
        password: createHash(password)
      });

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }
));

// Estrategia para login
passport.use('login', new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await UserModel.findOne({ email });
      if (!user || !isValidPassword(user, password)) {
        return done(null, false, { message: 'Credenciales inválidas' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Estrategia JWT (nótese que la nombramos 'jwt' para seguir el estándar)
passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
}, async (jwtPayload, done) => {
  try {
    const user = await UserModel.findById(jwtPayload.id);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
