export const isAuth = (req, res, next) => {
  if (req.user) return next();
  return res
    .status(401)
    .json({ status: "error", message: "No estás autenticado" });
};


export const authRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "No autenticado" });
  }
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({
        status: "error",
        message: "No tienes permisos para esta acción",
      });
  }
  next();
};
