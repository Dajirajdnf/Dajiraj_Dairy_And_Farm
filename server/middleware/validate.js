const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations safely (supports both express-validator chains and standard middleware)
      for (const validation of validations) {
        if (typeof validation?.run === 'function') {
          await validation.run(req);
        } else if (typeof validation === 'function') {
          await new Promise((resolve, reject) => {
            validation(req, res, (err) => (err ? reject(err) : resolve()));
          });
        }
      }

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

    const errorsObj = {};
    const messages = [];
    errors.array().forEach((err) => {
      const field = err.path || err.param;
      if (field && !errorsObj[field]) {
        errorsObj[field] = err.msg;
      }
      if (!messages.includes(err.msg)) {
        messages.push(err.msg);
      }
    });

    const detailedMessage = `Validation failed: ${messages.join('. ')}`;

    return res.status(400).json({
      success: false,
      message: detailedMessage,
      errors: errorsObj,
    });
  } catch (err) {
    return next(err);
  }
};
};

module.exports = validate;
