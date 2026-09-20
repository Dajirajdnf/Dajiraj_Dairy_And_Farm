# 🛡️ Dajiraj Dairy & Farm — Security Audit & Hardening Report

This document records the security fortifications, audit logging, and resilience controls implemented across the Dajiraj Dairy & Farm application.

---

## 1. Vulnerability Assessment & Mitigations

### 1.1 NoSQL Injection Protection
- **Vulnerability**: Express/Mongoose applications parsing raw JSON bodies can be exploited by queries containing Mongo operators like `{"$gt": ""}` to bypass authentication or extract data.
- **Mitigation**: Implemented `server/middleware/sanitize.js` which recursively scans and strips any object keys prefixed with `$` or MongoDB operator syntax from `req.body`, `req.query`, and `req.params`. In addition, Mongoose schema casting and express-validator types enforce strict primitives.

### 1.2 Mass Assignment & Role Escalation
- **Vulnerability**: Endpoints using `Object.assign(model, req.body)` or `Model.create(req.body)` allow attackers to supply arbitrary fields, such as escalating a staff member to `role: 'admin'`, changing invoice balances, or altering customer rates.
- **Mitigation**: All controllers (`authController`, `customerController`, `staffController`, `deliveryBoyController`, `productController`, `deliveryController`, `invoiceController`, `settingsController`, `inquiryController`) now employ explicit field whitelisting. Server-side overrides guarantee `role`, `status`, and system timestamps cannot be tampered with.

### 1.3 Insecure Direct Object Reference (IDOR)
- **Vulnerability**: Delivery personnel could potentially manipulate deliveries belonging to other routes by specifying different delivery IDs.
- **Mitigation**: In `deliveryController.js`, delivery boy actions (`adjustQuantity`, `markComplete`, `getTodayDeliveries`, `getDeliveryBoyDashboard`) enforce ownership checks against `req.user._id`:
  ```javascript
  if (req.user.role === 'delivery' && delivery.deliveryBoy?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied: not assigned to you' });
  }
  ```

### 1.4 Rate Limiting & Denial of Service (DoS)
- **Mitigation**: Applied multi-tier `express-rate-limit`:
  - **Auth routes**: 20 requests / 15 minutes per IP.
  - **Public Inquiries**: 5 submissions / hour per IP.
  - **General API routes**: 300 requests / 15 minutes per IP.
  - **Body parser limit**: Restriced JSON payload size to `1mb` to prevent memory exhaustion attacks.

### 1.5 Sensitive Information & Credential Leaks
- **Mitigation**:
  - `Settings` model excludes `smtpPass` by default (`select: false`).
  - SMTP password is never echoed in error logs, test connection errors, or public responses.
  - In `errorHandler.js`, error messages matching `mongodb(+srv)://...` automatically mask user credentials (`***:***@`).
  - In production (`NODE_ENV === 'production'`), 500 error stack traces are suppressed and replaced with generic user-facing explanations.

### 1.6 Regular Expression Injection (ReDoS)
- **Mitigation**: All user-supplied search parameters are escaped with `replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` prior to being compiled into regular expressions for Mongoose queries.

---

## 2. Audit Trail & Compliance

### AuditLog Architecture
A dedicated collection `AuditLog` captures state-altering operations:
- **Fields**: `userId`, `action`, `resourceType`, `resourceId`, `details`, `ip`, `createdAt`.
- **Indexed**: `{ userId: 1 }`, `{ action: 1 }`, `{ createdAt: -1 }`, `{ resourceType: 1, resourceId: 1 }`.
- **Logged Events**:
  - `USER_LOGIN`
  - `PASSWORD_CHANGED`
  - `CUSTOMER_CREATED`, `CUSTOMER_UPDATED`, `CUSTOMER_DEACTIVATED`, `CUSTOMER_REORDERED`
  - `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DEACTIVATED`, `STOCK_ADJUSTED`
  - `STAFF_CREATED`, `STAFF_UPDATED`, `STAFF_DEACTIVATED`
  - `DELIVERY_BOY_CREATED`, `DELIVERY_BOY_UPDATED`, `DELIVERY_BOY_DEACTIVATED`
  - `DELIVERIES_GENERATED`, `DELIVERY_STATUS_UPDATED`
  - `INVOICE_GENERATED`, `INVOICE_PAYMENT_UPDATED`, `INVOICE_VOIDED`, `INVOICE_EMAILED`
  - `SETTINGS_UPDATED`, `SMTP_TESTED`
  - `INQUIRY_STATUS_UPDATED`, `INQUIRY_DELETED`
  - `CRON_MONTHLY_INVOICES`, `CRON_DAILY_DELIVERIES`
- **Fail-Safe Mechanism**: The `logAudit` utility catches and suppresses logging failures without breaking the user request pipeline.

---

## 3. Serverless & Deployment Hardening

### Vercel Serverless Function Safeguards
1. **Connection Caching**: Global Mongoose connection caching (`global._mongooseConnection`) avoids socket connection leaks across lambda invocations.
2. **Lazy Connect Middleware**: Auto-reconnects before any API operation if the connection state is dropped or cold-started.
3. **Cron Secret Verification**: Automated cron endpoints (`/api/cron/*`) require header `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret`.
4. **Resilient PDF Generation**:
   - Primary: High-fidelity headless Chromium PDF output.
   - Serverless: Puppeteer-core + Sparticuz Chromium compatibility.
   - Failover: Direct HTML print route (`/api/invoices/:id/html`) ensuring invoice access even when lambda environment binaries fail.

---

## 4. Verification & Validation Summary

| Security Measure | Status | Details |
|---|---|---|
| NoSQL Injection Filter | ✅ Verified | Sanitizes body, query, params |
| Mass Assignment Guard | ✅ Verified | Strict field whitelist across 10 controllers |
| IDOR Checks | ✅ Verified | Delivery boy boundaries enforced |
| Credential Redaction | ✅ Verified | MongoDB and SMTP passwords masked |
| Password Minimum | ✅ Verified | Increased to 8 characters with strength check |
| Audit Logging | ✅ Verified | Implemented across all administrative operations |
| Rate Limiting | ✅ Verified | Enforced for auth, inquiries, and API |
| Vercel Deployment | ✅ Verified | Serverless handler and rewrites configured |
