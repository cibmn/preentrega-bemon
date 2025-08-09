// Middleware de autenticación
export const isAuth = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ status: 'error', message: 'No estás autenticado' });
};

// Middleware de autorización de roles
export const authRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ status: 'error', message: 'No autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ status: 'error', message: 'Acceso denegado' });
    }
    next();
  };
};
