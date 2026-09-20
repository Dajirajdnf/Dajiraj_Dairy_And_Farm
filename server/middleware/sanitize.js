/**
 * NoSQL Injection Protection Middleware
 * Strips MongoDB query operators ($gt, $where, etc.) from
 * request body, query string, and params to prevent injection.
 */

const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitize(obj[key]);
    }
  }
  return obj;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

module.exports = sanitizeRequest;
