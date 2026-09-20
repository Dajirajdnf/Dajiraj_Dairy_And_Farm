# Antigravity Prompt — Dajiraj Dairy & Farm Full-Stack Dairy Management System

## 1. PROJECT OVERVIEW

Build a complete production-ready **MERN stack** web application for a dairy business named:

**DAJIRAJ DAIRY & FARM**

Logo tagline/spelling from the provided reference:
- **Milking with Care**
- **Farming with Love**

The application must include:

1. Public dynamic website / landing page
2. Admin panel
3. Staff panel
4. Delivery Boy panel
5. Customer management
6. Daily milk delivery management
7. Stock/product management
8. Monthly billing and invoice PDF generation
9. SMTP email sending for invoices
10. Dashboard and reports
11. Authentication and role-based authorization
12. Responsive UI for desktop, tablet and mobile
13. Proper REST APIs, database models and validation
14. Production-ready architecture

IMPORTANT:
- I will NOT provide the logo separately to Antigravity.
- Use the logo reference and branding description contained in this prompt.
- Do not depend on an external image/file being available.
- Recreate the visual identity using the logo description below.
- Keep the business name spelling exactly as **DAJIRAJ DAIRY & FARM**.

---

# 2. BRANDING / UI DESIGN

The supplied logo is a circular agricultural/dairy logo.

Visual elements visible in the reference:
- Green circular outer border
- Green primary branding
- White typography
- Warm orange/golden accents
- Brown/cow/agriculture elements
- A farmer illustration wearing a red/orange turban and blue clothing
- Cow illustration
- Agricultural/farming imagery
- Main wording: **DAJIRAJ DAIRY & FARM**
- Tagline: **Milking with Care**
- Secondary tagline: **Farming with Love**

Use this as the design direction.

## Suggested design language

Primary:
- Deep natural green
- Medium/farm green
- White

Secondary:
- Warm golden/yellow
- Earth/brown
- Orange/red accent inspired by the turban

The exact colors should be centralized in CSS variables/theme configuration so they can easily be changed later.

Do NOT make the website look like a generic SaaS dashboard.

The UI should feel:
- Fresh
- Natural
- Agricultural
- Trustworthy
- Premium but simple
- Family dairy/farm oriented
- Clean and professional

Use:
- Rounded cards
- Soft shadows
- Clean typography
- Green CTA buttons
- Subtle agricultural/dairy visual elements
- Consistent spacing
- Professional tables
- Clear status badges
- Mobile-friendly layouts

Avoid excessive animations.

Use tasteful animations only where they improve UX.

---

# 3. TECHNOLOGY STACK

Use MERN:

## Frontend
- React
- Vite
- React Router
- Modern JavaScript/TypeScript if appropriate
- Axios
- Tailwind CSS OR clean modular CSS
- Reusable components
- Form validation
- Responsive design
- Charts for dashboard analytics

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt/password hashing
- Nodemailer for SMTP
- PDF invoice generation

## Recommended supporting libraries

Use stable libraries where appropriate for:
- PDF generation
- Email
- Charts
- Validation
- Date handling
- Drag and drop
- Toast notifications
- File handling

Do not introduce unnecessary dependencies.

---

# 4. APPLICATION ROLES

Implement proper RBAC.

Roles:

### ADMIN
Full access:
- Dashboard
- Customers
- Staff
- Delivery Boys
- Milk delivery
- Products
- Stock
- Invoices
- Reports
- Settings
- SMTP configuration
- User management
- CRUD operations

### STAFF
Access should be configurable by Admin.

Default staff capabilities:
- View/manage customers
- Create/update customer records
- View delivery schedules
- Manage assigned operational tasks
- View invoices
- Generate invoices if permission is enabled
- View stock
- Perform allowed CRUD operations

Staff must NOT be able to:
- Create Admin users
- Modify Admin permissions
- Modify critical system settings unless explicitly permitted

### DELIVERY BOY
Restricted operational account:
- Login
- See assigned customers
- See today's delivery list
- See customer address
- Open Google Maps link
- See daily required milk quantity
- Increase quantity by +250 ml
- Decrease quantity by -250 ml
- Mark delivery as completed
- See today's delivery status
- See relevant delivery history
- See monthly delivery summary for assigned customers

Delivery boys should only access customers/orders assigned to them.

---

# 5. AUTHENTICATION

Create a secure login system.

## Login

Fields:
- Email / username
- Password

Features:
- JWT based authentication
- Secure password hashing
- Role-based route protection
- Automatic logout on expired token
- Persistent login where appropriate
- Proper unauthorized/forbidden handling

Create protected routes for:
- `/admin/*`
- `/staff/*`
- `/delivery/*`

Do not expose protected API endpoints without authorization.

---

# 6. PUBLIC LANDING WEBSITE

Create a beautiful public website for Dajiraj Dairy & Farm.

Pages:

## HOME

Sections:

### Hero
Business name:
**DAJIRAJ DAIRY & FARM**

Tagline:
**Milking with Care**

Supporting line:
**Farming with Love**

CTA buttons:
- Contact Us
- Send Inquiry
- Explore Our Products

Hero should communicate:
- Fresh dairy
- Farm-to-family trust
- Quality
- Care
- Natural farming

### About Preview
Short introduction to Dajiraj Dairy & Farm.

### Dairy Products
Dynamic product cards.

Examples:
- Fresh Milk
- Cow Milk
- Buffalo Milk
- Curd
- Buttermilk
- Paneer
- Ghee
- Other products

IMPORTANT:
Products should be managed dynamically from Admin rather than hard-coded.

### Why Choose Us
Examples:
- Fresh Daily
- Farm Fresh
- Quality Focused
- Hygienic Handling
- Reliable Delivery
- Farming with Love

### Daily Milk Delivery
Explain subscription/daily delivery service.

### Contact CTA
Strong call-to-action to contact/inquire.

### Footer
Include:
- Business name
- Tagline
- Contact information
- Address
- Google Maps
- Navigation
- Social links if configured
- Copyright

---

# 7. ABOUT US PAGE

Create a detailed About Us page.

Include:
- Dajiraj Dairy & Farm story
- Farming philosophy
- Dairy quality
- Customer commitment
- Milk delivery service
- "Milking with Care"
- "Farming with Love"

Do not invent specific claims such as certifications, years of operation, organic certification, herd size, etc.

Make these values configurable from Admin/CMS settings if needed.

---

# 8. CONTACT US PAGE

Include:
- Phone
- Email
- Address
- Google Maps location
- Business hours
- Contact form

Contact form fields:
- Name
- Email
- Phone
- Subject
- Message

Store inquiries in MongoDB.

Admin should be able to:
- View inquiries
- Mark inquiry as new/read/resolved
- Delete inquiry
- Contact the customer manually

---

# 9. INQUIRY FORM

Create a reusable inquiry form.

Fields:
- Name
- Email
- Phone
- Product/service interested in
- Message

Validation:
- Required name
- Valid email when entered
- Valid Indian mobile number
- Message required

Show:
- Success message
- Error message
- Loading state

Protect backend APIs from spam/basic abuse.

---

# 10. ADMIN DASHBOARD

Create a professional dashboard.

Show cards:

- Total Customers
- Active Daily Milk Customers
- Today's Expected Milk
- Today's Delivered Milk
- Pending Deliveries
- Completed Deliveries
- Total Products
- Low Stock Products
- Current Month Revenue
- Pending Invoice Amount
- New Inquiries

Use charts:

### Milk Delivery Chart
- Daily milk delivered
- Monthly trend

### Revenue Chart
- Monthly revenue

### Customer Chart
- Active vs inactive customers

### Delivery Status
- Completed
- Pending
- Skipped/missed if applicable

Dashboard must update from actual MongoDB data.

---

# 11. CUSTOMER MANAGEMENT

Admin/authorized Staff can perform CRUD.

Customer fields:

```text
Customer ID
Name
Email
Phone
Address
Google Maps Link
Per Day Milk Quantity
Milk Unit
Assigned Staff
Assigned Delivery Boy
Status
Joining Date
Billing Rate
Notes
Created At
Updated At
```

## Required creation flow

When creating a daily milk customer:

1. Enter customer name
2. Email
3. Phone
4. Address
5. Google Maps link
6. Per-day milk purchase in litres
7. Billing rate
8. Assign staff
9. Assign delivery boy
10. Active/inactive status

Validate all required fields.

Phone:
- Indian 10-digit mobile number validation
- Store normalized phone number

Milk quantity:
- Store internally in litres or millilitres consistently.
- Prefer millilitres for delivery calculations to avoid floating point problems.

Example:
1 litre = 1000 ml
1.25 litre = 1250 ml
750 ml = 750 ml

---

# 12. CUSTOMER LIST

Create a powerful customer table.

Columns:
- Customer
- Phone
- Daily Milk
- Assigned Staff
- Delivery Boy
- Status
- Today's Delivery
- Monthly Quantity
- Actions

Features:
- Search
- Filter
- Sort
- Pagination
- View
- Edit
- Delete/deactivate
- Assign delivery boy
- Assign staff

---

# 13. DRAG & DROP CUSTOMER ORDERING

Admin/authorized staff should be able to arrange the daily delivery order using drag and drop.

Example:

```text
1. Customer A
2. Customer B
3. Customer C
4. Customer D
```

Drag:

```text
Customer D
```

to:

```text
Position 2
```

The new order should be persisted in MongoDB.

Store:
- Delivery route/order priority
- Assigned delivery boy
- Delivery date

The delivery boy should receive the same ordered list.

The ordering should support different routes/delivery boys.

---

# 14. STAFF MANAGEMENT

Admin only can create staff accounts.

Staff fields:
- Name
- Email
- Phone
- Password
- Address
- Role
- Permissions
- Active/inactive
- Created date

CRUD:
- Create
- View
- Edit
- Activate/deactivate
- Delete

Permissions should be granular where practical.

Example:
- Customer management
- Delivery management
- Stock management
- Invoice management
- Inquiry management

Admin remains unrestricted.

---

# 15. DELIVERY BOY MANAGEMENT

Admin only can create delivery boy accounts.

Fields:
- Name
- Email
- Phone
- Password
- Address
- Vehicle/route information if required
- Assigned area
- Active/inactive

CRUD:
- Create
- View
- Edit
- Activate/deactivate
- Delete

Admin assigns customers to delivery boys.

---

# 16. DAILY MILK DELIVERY SYSTEM

This is the core functionality.

Every active daily milk customer should have a delivery record for the relevant date.

Date should be generated automatically from the server/current date.

Do not ask delivery staff to manually enter today's date.

Each delivery record should contain:

```text
Delivery ID
Customer
Delivery Boy
Staff
Date
Base Quantity
Adjustment
Final Quantity
Adjustment Reason
Status
Delivered At
Notes
```

---

# 17. DELIVERY QUANTITY CONTROLS

For every customer on the delivery boy's list show:

```text
Customer Name
Phone
Address
Daily Quantity
[-]  [Quantity]  [+]
[Mark Delivered]
[Open Map]
```

### Exact quantity

If the customer normally takes:

**1 litre**

then delivery quantity remains:

**1 litre**

### Plus

Pressing `+` increases by exactly:

**250 ml**

Example:

1.00 L → 1.25 L

Press again:

1.25 L → 1.50 L

### Minus

Pressing `-` decreases by exactly:

**250 ml**

Example:

1.00 L → 0.75 L

Never allow quantity to become negative.

Recommended minimum:
0 ml.

Admin should be able to configure the adjustment increment later, but default must be **250 ml**.

---

# 18. DELIVERY COMPLETION

When delivery boy clicks:

**Delivery Done**

Record:
- Date
- Time
- Delivered quantity
- Delivery boy
- Customer
- Final quantity
- Status = Delivered

After completion:
- Show clear completed state
- Prevent accidental duplicate completion
- Allow authorized admin/staff correction
- Keep audit information

Example statuses:

```text
Pending
Delivered
Skipped
Cancelled
Corrected
```

Do not silently overwrite historical records.

---

# 19. DELIVERY BOY DASHBOARD

Dashboard should show:

### Today
- Total assigned customers
- Completed deliveries
- Pending deliveries
- Total litres expected
- Total litres delivered

### Progress

Example:

```text
18 / 25 Deliveries Completed
72% Complete
```

### Monthly
- Total deliveries
- Total litres delivered
- Customer-wise summary

Show today's date automatically.

Use Indian date formatting where appropriate, but store dates consistently in backend.

---

# 20. ADMIN DELIVERY DASHBOARD

Admin can see all delivery activity.

Filters:
- Date
- Delivery Boy
- Staff
- Customer
- Status

Show:
- Expected litres
- Delivered litres
- Pending litres
- Number of customers
- Completion percentage

Customer-level details should show:

```text
Customer
Base quantity
Adjustment
Final quantity
Status
Delivery boy
Delivery time
```

---

# 21. STOCK MANAGEMENT

Admin and authorized Staff can manage stock.

Stock CRUD:

```text
Product Name
SKU
Category
Description
Unit
Selling Price
Purchase Price
Current Stock
Minimum Stock
Status
Created At
Updated At
```

Categories can include:
- Milk
- Curd
- Paneer
- Buttermilk
- Ghee
- Other Dairy Products

Features:
- Add product
- Edit product
- Delete/deactivate product
- Increase stock
- Decrease stock
- Stock adjustment
- Stock history
- Search/filter

---

# 22. LOW STOCK

Admin dashboard should highlight low-stock products.

Condition:

```text
Current Stock <= Minimum Stock
```

Show:
- Low Stock alert
- Product
- Current quantity
- Minimum quantity

Make the threshold configurable per product.

---

# 23. PRODUCT MANAGEMENT

Admin should be able to CRUD public dairy products.

Fields:
- Product name
- Description
- Category
- Price
- Unit
- Image URL/upload if supported
- Availability
- Display order
- Active/inactive

Products should automatically appear on the public landing page.

---

# 24. MONTHLY MILK BILLING

Implement automated monthly billing.

At the beginning of every month, generate invoices for the previous month's delivered milk.

Example:

On:

**1 September**

generate billing for:

**1 August – 31 August**

Only use actual delivery records for billing.

Do not bill customers for deliveries marked:
- Cancelled
- Skipped

Use delivered quantities.

---

# 25. BILLING CALCULATION

Customer has a configurable milk rate.

Example:

```text
Rate = ₹60 / litre
Delivered quantity = 1.25 litre
Amount = 1.25 × ₹60
      = ₹75
```

For every billing period calculate:

```text
Total Delivered Quantity
×
Applicable Rate
=
Milk Amount
```

Support rate changes over time.

IMPORTANT:
Historical invoices must retain the rate used at that time.

Do not recalculate old invoices using today's rate.

---

# 26. MONTHLY INVOICE

Invoice should contain:

## Header

**DAJIRAJ DAIRY & FARM**

Taglines:
**Milking with Care**
**Farming with Love**

Business contact details from Admin settings.

## Customer

- Name
- Phone
- Email
- Address

## Billing

- Invoice number
- Invoice date
- Billing period
- Due date if configured

## Milk summary

```text
Date | Quantity | Rate | Amount
```

or an equivalent monthly summary format.

At minimum include:
- Total litres
- Rate
- Subtotal
- Adjustments if any
- Grand total

Invoice should be professionally designed and match the green/golden dairy branding.

---

# 27. INVOICE NUMBERING

Implement unique invoice numbers.

Example:

```text
DDF-2026-000001
DDF-2026-000002
```

Use a reliable server-side sequence.

Never generate duplicate invoice numbers.

---

# 28. PDF GENERATION

Admin/authorized Staff can:

- View invoice
- Generate PDF
- Download PDF
- Email PDF
- Regenerate/view safely
- Print invoice

The PDF must visually match the invoice viewing page.

IMPORTANT:
There must be ONE invoice design/source of truth.

The following must all use the same invoice structure:
- Invoice viewing page
- Downloaded PDF
- Email attachment
- Printable invoice

Do not create separate designs for web/PDF/email.

---

# 29. SMTP EMAIL

Implement SMTP email using Nodemailer.

Admin settings should support:

```text
SMTP Host
SMTP Port
SMTP Username
SMTP Password
From Name
From Email
Secure/TLS setting
```

Never expose SMTP password to frontend after saving.

Store secrets securely.

Create:

### Test SMTP Connection

Admin can test the configured SMTP settings.

Show:
- Success
- Failure
- Useful error message

---

# 30. EMAIL INVOICE

On invoice page provide:

**Send Invoice Email**

Flow:

1. Confirm customer email
2. Generate current invoice PDF
3. Send email using SMTP
4. Attach PDF
5. Save email status

Track:

```text
Sent
Failed
Pending
```

Store:
- Sent time
- Recipient
- Invoice ID
- Error if failed

Do not expose SMTP credentials in API responses.

---

# 31. AUTOMATIC MONTHLY INVOICE JOB

Implement a backend scheduled job.

At the beginning of each month:
1. Identify customers eligible for monthly billing
2. Fetch previous month's delivered milk records
3. Calculate total quantity
4. Apply historical applicable rate
5. Generate invoice
6. Save invoice
7. Generate PDF when required
8. Email invoice if customer has a valid email and automatic email is enabled
9. Log success/failure

The job must be idempotent.

If the server restarts or the job runs twice, it must NOT create duplicate invoices for the same customer and billing period.

Use a unique constraint such as:

```text
customerId + billingPeriodStart + billingPeriodEnd
```

---

# 32. MANUAL INVOICE GENERATION

Admin should also be able to manually generate an invoice.

Allow:
- Customer
- Billing month
- Start date
- End date
- Recalculate
- Generate

Prevent duplicate invoice creation unless Admin explicitly chooses to regenerate/correct.

---

# 33. INVOICE LIST

Admin dashboard/page:

Columns:
- Invoice Number
- Customer
- Billing Period
- Quantity
- Amount
- Status
- Email Status
- Created Date
- Actions

Actions:
- View
- Download
- Email
- Print
- Mark paid/unpaid
- Void if permitted

---

# 34. PAYMENT STATUS

Invoice should support:

```text
Unpaid
Partially Paid
Paid
Overdue
Void
```

Add payment fields:

```text
Total Amount
Paid Amount
Remaining Amount
Payment Date
Payment Method
Payment Notes
```

Admin/staff with permission can update payment status.

---

# 35. REPORTS

Create reports for Admin.

## Milk Report
- Daily
- Weekly
- Monthly
- Customer-wise
- Delivery-boy-wise

## Revenue Report
- Daily
- Monthly
- Customer-wise

## Customer Report
- Active customers
- Inactive customers
- New customers
- Customer milk quantity

## Delivery Report
- Completed
- Pending
- Skipped
- Customer-wise
- Delivery-boy-wise

## Stock Report
- Current stock
- Low stock
- Stock movements

Provide filters and export where practical.

---

# 36. SETTINGS

Admin Settings should include:

## Business Settings
- Business name
- Tagline
- Phone
- Email
- Address
- Google Maps link
- Business hours
- Website/social links

## Branding
- Logo configuration
- Primary color
- Secondary color
- Invoice branding

## Billing
- Default milk rate
- Invoice prefix
- Tax configuration if required
- Payment terms

Do not assume a tax/GST requirement unless Admin configures it.

## Delivery
- Default quantity adjustment = 250 ml
- Delivery cutoff/configuration if needed

## SMTP
All SMTP settings described above.

---

# 37. DATABASE MODELS

Create clean Mongoose schemas.

At minimum:

### User
```text
name
email
phone
passwordHash
role
permissions
active
createdAt
updatedAt
```

### Customer
```text
name
email
phone
address
googleMapsLink
dailyMilkQuantityMl
milkRate
assignedStaff
assignedDeliveryBoy
deliveryOrder
active
joiningDate
notes
createdAt
updatedAt
```

### Product
```text
name
sku
category
description
unit
sellingPrice
purchasePrice
currentStock
minimumStock
active
displayOrder
createdAt
updatedAt
```

### Delivery
```text
customer
deliveryBoy
staff
date
baseQuantityMl
adjustmentMl
finalQuantityMl
status
deliveredAt
notes
createdAt
updatedAt
```

### Invoice
```text
invoiceNumber
customer
billingPeriodStart
billingPeriodEnd
invoiceDate
lineItems
totalQuantityMl
rate
subtotal
adjustments
grandTotal
paidAmount
remainingAmount
paymentStatus
emailStatus
pdfPath/reference
createdAt
updatedAt
```

### Inquiry
```text
name
email
phone
product
message
status
createdAt
updatedAt
```

### StockTransaction
```text
product
type
quantity
reason
reference
createdBy
createdAt
```

### Settings
Store business/system configuration safely.

---

# 38. DAILY DELIVERY DATA GENERATION

Do NOT rely only on the customer master record.

Each active customer's daily delivery should become a historical delivery record.

Example:

Customer base quantity:

```text
1000 ml
```

On August 20:

```text
1000 ml
```

On August 21:

```text
1250 ml
```

On August 22:

```text
750 ml
```

Historical records must remain unchanged.

Monthly billing should read the historical daily records.

---

# 39. CUSTOMER QUANTITY CHANGES

If Admin changes a customer's default daily quantity:

Example:

Old:
```text
1000 ml
```

New:
```text
1500 ml
```

The new value applies to future delivery records.

Do NOT modify old delivery history.

---

# 40. DELIVERY HISTORY

For each customer show:

- Date
- Base quantity
- Adjustment
- Final quantity
- Delivery status
- Delivery boy
- Delivered time

Admin should be able to correct erroneous records with audit information.

---

# 41. ROUTE MANAGEMENT

For delivery boys, support:

```text
Delivery Boy
   ↓
Assigned Customers
   ↓
Drag & Drop Route Order
   ↓
Today's Delivery List
```

The delivery boy sees the exact sequence configured by Admin.

Google Maps button should open the customer's stored Google Maps link.

---

# 42. UI COMPONENTS

Build reusable components:

- Navbar
- Footer
- Sidebar
- Dashboard cards
- Data table
- Search bar
- Filters
- Modal
- Confirmation dialog
- Form components
- Date picker
- Status badge
- Loading skeleton
- Empty state
- Error state
- Toast notification
- Pagination
- Invoice preview
- PDF/print actions
- Quantity stepper
- Drag/drop customer list

---

# 43. MOBILE RESPONSIVENESS

The delivery boy interface is especially important on mobile.

Optimize for:
- Android phones
- Small screens
- Touch interaction
- Large + / - buttons
- Easy "Delivery Done" button
- Easy Google Maps access

Admin/staff dashboards must also remain usable on tablets and mobile.

---

# 44. API DESIGN

Create clean REST APIs.

Examples:

```text
POST   /api/auth/login
GET    /api/auth/me

GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

GET    /api/deliveries/today
POST   /api/deliveries
PATCH  /api/deliveries/:id/quantity
PATCH  /api/deliveries/:id/complete

GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/invoices
POST   /api/invoices/generate
GET    /api/invoices/:id
GET    /api/invoices/:id/pdf
POST   /api/invoices/:id/email

GET    /api/staff
POST   /api/staff
PUT    /api/staff/:id
DELETE /api/staff/:id

GET    /api/delivery-boys
POST   /api/delivery-boys
PUT    /api/delivery-boys/:id
DELETE /api/delivery-boys/:id

GET    /api/inquiries
POST   /api/inquiries
PATCH  /api/inquiries/:id
DELETE /api/inquiries/:id

GET    /api/dashboard
GET    /api/reports/*
GET    /api/settings
PUT    /api/settings
```

Use proper HTTP status codes.

---

# 45. SECURITY

Implement:

- bcrypt password hashing
- JWT authentication
- Authorization middleware
- Role-based access
- Input validation
- MongoDB query safety
- Rate limiting on authentication
- CORS configuration
- Helmet/security headers
- Secure cookies if used
- SMTP secret protection
- Environment variables
- No hardcoded passwords/secrets
- No sensitive information in frontend source

Never store plain-text passwords.

---

# 46. ENVIRONMENT VARIABLES

Create:

```env
PORT=
MONGODB_URI=
JWT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=
SMTP_FROM_EMAIL=
SMTP_SECURE=

CLIENT_URL=
SERVER_URL=
```

Provide:

```text
.env.example
```

Never commit `.env`.

---

# 47. PROJECT STRUCTURE

Use a clean structure similar to:

```text
dajiraj-dairy/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── App.*
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── jobs/
│   ├── utils/
│   ├── config/
│   ├── templates/
│   ├── app.*
│   └── package.json
│
├── .env.example
├── README.md
└── package.json
```

Adapt the structure if a better production architecture is appropriate.

---

# 48. ERROR HANDLING

Every page/API should handle:

- Loading
- Empty data
- Network failure
- Validation error
- Unauthorized
- Forbidden
- Server error

Show human-readable messages.

Never expose stack traces to normal users.

Backend should have centralized error handling.

---

# 49. DATA VALIDATION

Examples:

### Phone
Exactly valid Indian 10-digit mobile format.

### Email
Proper email format.

### Quantity
Must be >= 0.

### + / -
Exactly 250 ml by default.

### Customer
Name and required daily quantity cannot be empty.

### Invoice
Do not allow duplicate billing periods for same customer.

---

# 50. AUDIT / HISTORY

For important changes, preserve history where appropriate.

Especially:
- Delivery corrections
- Milk quantity changes
- Rate changes
- Invoice changes
- Stock adjustments
- User changes

Do not silently destroy historical billing data.

---

# 51. UX REQUIREMENTS

Every action should provide feedback.

Examples:

```text
Customer Created Successfully
Delivery Marked as Completed
Quantity Increased to 1.25 L
Invoice Generated Successfully
Invoice Email Sent Successfully
Stock Updated Successfully
```

Use confirmation dialogs before destructive actions.

---

# 52. SEED DATA

Create a seed script for development.

Include:
- 1 Admin
- 2 Staff
- 2 Delivery Boys
- Sample customers
- Sample dairy products
- Sample delivery records
- Sample invoices

Clearly document development login credentials in README only.

Do not use production credentials.

---

# 53. DEMO WORKFLOW

The application must support this complete workflow:

```text
PUBLIC WEBSITE
      ↓
Customer sends inquiry
      ↓
Admin sees inquiry
      ↓
Admin creates customer
      ↓
Admin enters:
Name
Email
Phone
Address
Google Maps Link
Daily Milk Quantity
Milk Rate
      ↓
Admin assigns Staff
      ↓
Admin assigns Delivery Boy
      ↓
Customer appears in delivery boy's account
      ↓
Admin arranges delivery order using drag & drop
      ↓
Delivery Boy logs in
      ↓
Sees today's ordered customers
      ↓
Customer takes normal quantity
OR
      ↓
Press + / -
      ↓
Quantity changes by 250 ml
      ↓
Delivery Boy presses Delivery Done
      ↓
Delivery record saved
      ↓
Admin dashboard updates
      ↓
Repeat daily
      ↓
Month ends
      ↓
1st of next month
      ↓
Previous month's delivery records calculated
      ↓
Monthly invoice generated
      ↓
Invoice PDF generated
      ↓
Email invoice through SMTP
      ↓
Admin can view/download/email invoice
```

---

# 54. IMPORTANT BILLING RULES

Use actual delivered quantities.

Example:

Customer daily base:
```text
1 L
```

Month:

```text
Day 1  = 1.00 L
Day 2  = 1.25 L
Day 3  = 0.75 L
...
```

Invoice total must use:

```text
SUM(all delivered final quantities)
```

Then:

```text
Total litres × applicable rate
```

Do not simply multiply the customer's current daily quantity by number of days.

This is critical.

---

# 55. MONTHLY BILLING EDGE CASES

Handle:

### Customer joins mid-month
Bill only from joining/eligible delivery date.

### Customer becomes inactive
Stop future deliveries according to the effective date, but preserve previous records.

### No deliveries in a month
Do not generate a zero-value invoice unless Admin explicitly enables zero invoices.

### Customer has no email
Generate invoice but mark email as unavailable/failed-to-send with a clear reason.

### Duplicate monthly job
Do not generate duplicate invoices.

### Rate change during month
Use the applicable rate for each delivery/date or equivalent rate-period calculation.

Historical rates must remain preserved.

---

# 56. PUBLIC WEBSITE SEO

Implement basic SEO:

- Proper page titles
- Meta descriptions
- Semantic HTML
- Open Graph metadata
- Clean URLs
- Fast loading
- Responsive design
- Accessible buttons/forms
- Image alt text

Suggested title:

**Dajiraj Dairy & Farm | Fresh Dairy Products & Daily Milk Delivery**

---

# 57. ACCESSIBILITY

Use:
- Semantic HTML
- Proper labels
- Keyboard accessible controls
- Sufficient contrast
- Visible focus states
- ARIA only where needed
- Accessible form validation

---

# 58. PERFORMANCE

Optimize:
- API queries
- MongoDB indexes
- Pagination
- Lazy-loaded pages
- Image loading
- Dashboard queries
- Invoice generation
- Large delivery lists

Add indexes for commonly queried fields such as:
- customer phone
- customer email
- delivery date
- delivery boy
- invoice number
- invoice billing period

---

# 59. RESPONSIVE NAVIGATION

PUBLIC:

```text
Home
About Us
Products
Contact
Inquiry
Login
```

ADMIN:

```text
Dashboard
Customers
Milk Delivery
Delivery Boys
Staff
Products
Stock
Invoices
Reports
Inquiries
Settings
Logout
```

STAFF:

Only show authorized menu items.

DELIVERY BOY:

```text
Dashboard
Today's Deliveries
Delivery History
Profile
Logout
```

---

# 60. INVOICE UI SOURCE OF TRUTH

Create one reusable invoice component.

Example:

```text
InvoiceTemplate
```

Use the same data/layout rules for:
- Browser invoice
- Print
- PDF
- Email attachment

The user should never see a completely different invoice between viewing and downloading.

---

# 61. ADMIN CONTROLS

Admin must be able to control:
- Customer rate
- Product prices
- Minimum stock
- Delivery adjustment increment
- Staff permissions
- Delivery boy assignments
- Business information
- Invoice numbering
- SMTP
- Automatic invoice email setting
- Billing settings

---

# 62. NO HARDCODED BUSINESS DATA

Do not hardcode:
- Phone number
- Email
- Address
- Prices
- Milk rates
- SMTP credentials
- Google Maps location
- Staff names
- Delivery boys

Business information should come from Admin settings/database.

The only fixed branding identity is:

**DAJIRAJ DAIRY & FARM**

and the provided logo wording:

**Milking with Care**
**Farming with Love**

---

# 63. LOGO / BRAND REFERENCE

The reference logo is circular and contains:
- Farmer
- Cow
- Agricultural tool/farm imagery
- Green circular border
- Green banner
- White business name
- Orange/yellow accent text
- Red/orange turban
- Blue clothing

Use these visual characteristics to build the UI theme.

If an actual logo asset is not available to the generated project, create a clean text/shape-based brand treatment rather than using an unrelated stock logo.

Do not claim that the business is certified organic, government approved, or anything else not provided.

---

# 64. DEPLOYMENT READINESS

Prepare the application for deployment.

Frontend should be deployable to platforms such as:
- Vercel
- Netlify

Backend should be deployable to:
- Render
- Railway
- VPS
- Other Node hosting

MongoDB should support:
- MongoDB Atlas
- Self-hosted MongoDB

Do not assume localhost URLs in production.

Use environment variables.

Configure frontend API base URL dynamically.

---

# 65. README

Create a complete README containing:

1. Project overview
2. Features
3. Tech stack
4. Folder structure
5. Installation
6. Environment variables
7. MongoDB setup
8. Development commands
9. Seed command
10. Admin/staff/delivery login information for development
11. SMTP configuration
12. Monthly invoice job explanation
13. Build commands
14. Deployment instructions
15. Troubleshooting

---

# 66. DEVELOPMENT COMMANDS

Root should ideally support commands similar to:

```bash
npm install
npm run dev
npm run server
npm run client
npm run build
npm run seed
```

Adjust based on the actual project structure.

Ensure commands actually work.

---

# 67. TESTING

Before considering the project complete, test:

## Authentication
- Admin login
- Staff login
- Delivery boy login
- Invalid login
- Unauthorized access

## Customer
- Create
- Read
- Update
- Delete/deactivate
- Validation

## Delivery
- Today's list
- +250 ml
- -250 ml
- Cannot go below zero
- Delivery completion
- Historical record
- Admin synchronization

## Drag/drop
- Reorder customers
- Save order
- Correct delivery boy sees order

## Stock
- CRUD
- Stock adjustment
- Low stock

## Invoice
- Correct quantity
- Correct rate
- Correct monthly period
- No duplicate invoice
- PDF
- Print
- Email

## SMTP
- Valid configuration
- Invalid configuration
- Email success
- Email failure

## Responsive
- Desktop
- Tablet
- Mobile

---

# 68. CRITICAL IMPLEMENTATION REQUIREMENTS

Do NOT create a static mockup.

This must be a real full-stack application with:

- React frontend
- Express backend
- MongoDB database
- Real APIs
- Real authentication
- Real CRUD
- Real delivery records
- Real invoice calculations
- Real PDF generation
- Real SMTP email
- Real scheduled monthly billing
- Real role permissions

Do not fake data after the initial seed/demo setup.

---

# 69. BUILD QUALITY

Write maintainable production-quality code.

Avoid:
- Duplicate components
- Duplicate invoice templates
- Hardcoded data
- Giant files
- Unnecessary global state
- Insecure APIs
- Exposing secrets
- Silent errors
- Fake API calls

Use:
- Reusable services
- Controllers
- Models
- Middleware
- Validation
- Clear naming
- Consistent formatting
- Centralized configuration

---

# 70. FINAL ACCEPTANCE CRITERIA

The project is complete only when all of the following work:

### Public
- [ ] Home page
- [ ] About page
- [ ] Products
- [ ] Contact page
- [ ] Inquiry form
- [ ] Responsive UI
- [ ] Dajiraj branding

### Authentication
- [ ] Admin login
- [ ] Staff login
- [ ] Delivery boy login
- [ ] RBAC

### Admin
- [ ] Dashboard
- [ ] Customer CRUD
- [ ] Staff CRUD
- [ ] Delivery boy CRUD
- [ ] Product CRUD
- [ ] Stock CRUD
- [ ] Delivery management
- [ ] Drag/drop delivery ordering
- [ ] Invoice management
- [ ] Reports
- [ ] Inquiries
- [ ] Settings
- [ ] SMTP

### Staff
- [ ] Authorized customer operations
- [ ] Delivery visibility
- [ ] Invoice access according to permission
- [ ] Stock access according to permission

### Delivery Boy
- [ ] Today's delivery list
- [ ] Correct assigned customers
- [ ] Route/order
- [ ] Google Maps
- [ ] +250 ml
- [ ] -250 ml
- [ ] Delivery Done
- [ ] Daily dashboard
- [ ] Monthly summary

### Billing
- [ ] Historical delivery records
- [ ] Correct monthly calculation
- [ ] Automatic invoice generation on the 1st
- [ ] No duplicate invoices
- [ ] PDF
- [ ] Print
- [ ] Email
- [ ] Payment status

### Security
- [ ] Password hashing
- [ ] JWT
- [ ] RBAC
- [ ] Input validation
- [ ] Secure SMTP credentials
- [ ] Environment variables

---

# 71. EXECUTION INSTRUCTION TO ANTIGRAVITY

Do not stop after generating the UI.

Build the complete application end-to-end.

First create the architecture and database models.

Then implement backend APIs and authentication.

Then implement the public website.

Then implement Admin, Staff and Delivery Boy panels.

Then implement daily delivery logic.

Then implement monthly billing.

Then implement PDF invoice generation.

Then implement SMTP email.

Then implement the automatic monthly invoice job.

Then test all critical workflows.

Fix all build/runtime/API errors.

Finally provide:
- Complete working source code
- README
- `.env.example`
- Seed script
- Database setup instructions
- Deployment instructions

The final application should feel like a real operational dairy-management system for **DAJIRAJ DAIRY & FARM**, not a demo or static dashboard.

## MOST IMPORTANT BUSINESS RULE

The system revolves around:

**Customer → Daily Milk Quantity → Daily Delivery → Actual Delivered Quantity → Monthly Calculation → Invoice → PDF → SMTP Email**

Build the database and application architecture around this workflow so historical delivery and billing data remains accurate and auditable.
