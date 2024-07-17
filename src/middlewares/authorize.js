// middleware/authorize.js
function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRole = parseInt(req.userLogged.cargo_id); // Supondo que o cargo do usuário está armazenado em req.user.role

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };
}

module.exports = authorize;
