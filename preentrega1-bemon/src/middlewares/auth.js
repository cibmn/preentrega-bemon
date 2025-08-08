export const isAuth = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ status: 'error', message: 'No estás autenticado' });
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ status: 'error', message: 'No tienes permisos de administrador' });
};

export const authorizeRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }
  if (req.user.role !== role) {
    return res.status(403).json({ status: 'error', message: 'No tienes permisos para esta acción' });
  }
  next();
};
