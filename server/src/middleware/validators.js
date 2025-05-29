const { body, validationResult } = require('express-validator');

const validateApiSpec = [
  body('url')
    .optional()
    .trim()
    .isURL({ 
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      allow_underscores: true
    })
    .withMessage('Invalid URL format. Please provide a valid HTTP/HTTPS URL'),
  body('spec')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      return typeof value === 'object' && value !== null;
    })
    .withMessage('Invalid OpenAPI specification format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateApiSpec
}; 