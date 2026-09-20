const AuditLog = require('../models/AuditLog');

/**
 * Log an administrative or sensitive action to the AuditLog collection.
 * Designed to be fire-and-forget (non-blocking, won't throw to disrupt primary flow).
 * 
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} [params.userId]
 * @param {string} params.action - e.g. 'CUSTOMER_CREATED', 'STAFF_UPDATED', 'INVOICE_GENERATED'
 * @param {string} [params.resourceType] - e.g. 'Customer', 'Product', 'User', 'Invoice'
 * @param {string|mongoose.Types.ObjectId} [params.resourceId]
 * @param {string} [params.details]
 * @param {Object} [params.req] - Express request object to extract IP and user if not provided
 */
const logAudit = async ({
  userId,
  action,
  resourceType = '',
  resourceId = null,
  details = '',
  req = null,
}) => {
  try {
    const finalUserId = userId || (req && req.user ? req.user._id : null);
    const ip = req
      ? req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || ''
      : '';

    await AuditLog.create({
      userId: finalUserId,
      action,
      resourceType,
      resourceId,
      details,
      ip,
    });
  } catch (err) {
    // Fail-safe: do not disrupt the request pipeline on logging error
    console.error('AuditLog write error:', err.message);
  }
};

module.exports = { logAudit };
