export const isAuth = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ 
    status: 'error', 
    message: 'No estás autenticado. Por favor inicia sesión.' 
  });
};

export const authRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'No autenticado. Inicia sesión para acceder a esta ruta.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: `Acceso denegado. Este recurso es solo para roles: ${roles.join(', ')}.` 
      });
    }

    next();
  };
};
