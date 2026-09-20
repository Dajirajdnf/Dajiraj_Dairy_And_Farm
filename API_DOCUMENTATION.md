# 🥛 Dajiraj Dairy & Farm — API Documentation

Comprehensive RESTful API specification for the Dajiraj Dairy & Farm platform.

**Base URL**: `/api`  
**Authentication**: Bearer Token in `Authorization: Bearer <JWT_TOKEN>` header  
**Content-Type**: `application/json`

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login with email or phone + password. Rate limited: 20 req/15 min. |
| `GET` | `/api/auth/me` | Protected | Returns authenticated user profile and permissions. |
| `PUT` | `/api/auth/change-password` | Protected | Change account password (min 8 chars, requires current password). |

### `POST /api/auth/login` Request Body
```json
{
  "email": "admin@dajiraj.com",
  "password": "yourpassword"
}
```

---

## 2. Customers (`/api/customers`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/customers` | Admin, Staff | Get list of customers. Query: `search`, `status`, `deliveryBoy`, `staff`, `page`, `limit`. |
| `GET` | `/api/customers/:id` | Admin, Staff | Retrieve single customer details. |
| `POST` | `/api/customers` | Admin, Staff | Create a new customer record. Field whitelisted. |
| `PUT` | `/api/customers/:id` | Admin, Staff | Update customer record. Whitelisted fields. |
| `DELETE` | `/api/customers/:id` | Admin | Soft delete (sets `active: false`). |
| `PUT` | `/api/customers/reorder` | Admin, Staff | Bulk update delivery route sequence. |

---

## 3. Products & Stock (`/api/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public / Admin | List products (`publicOnly=true` returns active items only). |
| `GET` | `/api/products/:id` | Public / Admin | Product detail. |
| `POST` | `/api/products` | Admin, Staff | Create a new product. |
| `PUT` | `/api/products/:id` | Admin, Staff | Update product attributes. |
| `DELETE` | `/api/products/:id` | Admin | Soft delete product. |
| `POST` | `/api/products/:id/stock` | Admin, Staff | Stock transaction (`in`, `out`, `adjustment`). |
| `GET` | `/api/products/:id/stock-history`| Admin, Staff | Stock audit ledger history. |

---

## 4. Deliveries (`/api/deliveries`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/deliveries/generate-today` | Admin | Generate delivery batch for all active customers. |
| `GET` | `/api/deliveries/today` | Delivery Boy | Get today's assigned deliveries (IDOR-protected). |
| `GET` | `/api/deliveries` | Admin, Staff | Query deliveries by date, status, customer, personnel. |
| `PATCH`| `/api/deliveries/:id/quantity` | Delivery Boy, Admin | Adjust delivery quantity (IDOR-protected). |
| `PATCH`| `/api/deliveries/:id/complete` | Delivery Boy, Admin | Mark delivery as Delivered (IDOR-protected). |
| `PATCH`| `/api/deliveries/:id/status` | Admin | Administrative delivery status correction. |
| `GET` | `/api/deliveries/my-dashboard` | Delivery Boy | Delivery personnel daily & monthly progress stats. |

---

## 5. Invoices & Billing (`/api/invoices`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/invoices` | Admin, Staff | Filter and list invoices with pagination. |
| `GET` | `/api/invoices/:id` | Admin, Staff | Single invoice summary with line items. |
| `POST` | `/api/invoices/generate` | Admin | Generate invoice for customer billing period. |
| `PATCH`| `/api/invoices/:id/payment` | Admin | Record payment (Paid, Partial, Void). |
| `GET` | `/api/invoices/:id/pdf` | Admin, Staff | Stream downloadable PDF buffer. |
| `GET` | `/api/invoices/:id/html` | Admin, Staff | Printable HTML invoice view. |
| `POST` | `/api/invoices/:id/email` | Admin | Send invoice PDF & summary to customer email via SMTP. |

---

## 6. Staff & Delivery Boys (`/api/staff`, `/api/delivery-boys`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/staff` | Admin | List all staff members. |
| `POST` | `/api/staff` | Admin | Create staff account with granular permissions. |
| `PUT` | `/api/staff/:id` | Admin | Update staff profile (role escalation protected). |
| `DELETE`| `/api/staff/:id` | Admin | Deactivate staff member. |
| `GET` | `/api/delivery-boys` | Admin | List delivery personnel. |
| `POST` | `/api/delivery-boys` | Admin | Create delivery personnel account. |
| `PUT` | `/api/delivery-boys/:id` | Admin | Update vehicle info, area, credentials. |
| `DELETE`| `/api/delivery-boys/:id` | Admin | Deactivate delivery personnel. |

---

## 7. Inquiries (`/api/inquiries`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/inquiries` | Public | Submit customer inquiry (Rate limited: 5/hr, XSS sanitized). |
| `GET` | `/api/inquiries` | Admin, Staff | List inquiries with status filter. |
| `PATCH`| `/api/inquiries/:id` | Admin, Staff | Update status (`new`, `read`, `resolved`). |
| `DELETE`| `/api/inquiries/:id` | Admin | Delete inquiry. |

---

## 8. Dashboard & Reports (`/api/dashboard`, `/api/reports`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Admin | Real-time KPIs, milk delivery volume, customer counts. |
| `GET` | `/api/dashboard/charts` | Admin | Historical delivery, customer, revenue chart data. |
| `GET` | `/api/reports/milk` | Admin | Milk distribution report. |
| `GET` | `/api/reports/revenue` | Admin | Revenue & collection report. |
| `GET` | `/api/reports/customers` | Admin | Customer retention & growth report. |
| `GET` | `/api/reports/delivery` | Admin | Delivery performance by personnel. |
| `GET` | `/api/reports/stock` | Admin | Inventory turnover report. |

---

## 9. Settings (`/api/settings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/settings` | Admin, Staff | Fetch business & system configurations. |
| `GET` | `/api/settings/public` | Public | Farm branding, phone, address, and social links. |
| `PUT` | `/api/settings` | Admin | Update settings (whitelisted fields, masked SMTP password). |
| `POST` | `/api/settings/test-smtp` | Admin | Test SMTP server connection. |

---

## 10. Automated Cron Jobs (`/api/cron`)

Protected by `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/cron/daily-deliveries` | Cron Secret | Generates daily delivery records at 00:00. |
| `POST` | `/api/cron/monthly-invoices` | Cron Secret | Generates monthly invoices for previous month on 1st at 00:05. |

---

## Standard Error Response Format
```json
{
  "success": false,
  "message": "Human-readable explanation of error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```
