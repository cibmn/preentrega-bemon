export const isAuth = (req, res, next) => {
  if (req.session.user) return next();
  return res.status(401).json({ status: 'error', message: 'No estás autenticado' });
};

export const isAdmin = (req, res, next) => {
  if (req.session.user?.role === 'admin') return next();
  return res.status(403).json({ status: 'error', message: 'No tienes permisos de administrador' });
};
