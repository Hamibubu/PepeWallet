const { query, body, validationResult } = require('express-validator');

const sanitizeAndValidateQuery = [
  // Verificar y sanitizar req.query.name si existe
  query('name')
    .optional()
    .trim()
    .escape(),

  // Verificar y sanitizar req.body._id si existe

  body('email')
    .optional()
    .trim()
    .escape(),

  // Verificar si hay errores de validación
  (req, res, next) => {
    if (req.query.name) {
        req.query.name = req.query.name.replace(/[|=&{}$"]/g, ''); // Realizar el replace en query.name
    }
    if (req.body.email){
        req.body.email = req.body.email.replace(/[=|&$"]/g, '');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = sanitizeAndValidateQuery;