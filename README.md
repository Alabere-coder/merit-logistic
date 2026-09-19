# Logistics & Courier Management Platform

A full-stack logistics and courier management platform built with **Next.js, TypeScript, and Supabase**.

The platform provides separate experiences for customers, drivers, and administrators, covering shipment creation, delivery management, tracking, payments, notifications, proof of delivery, driver earnings, and administrative management.

---

## 🚀 Features

### 👤 Customer

Customers can:

- Create an account
- Log in securely
- Create shipments
- Select package types
- Choose Standard or Express delivery
- View delivery price estimates
- Track shipments
- View shipment history
- Cancel eligible shipments
- View payment history
- Receive shipment notifications
- View shipment details and status timeline
- Manage account settings
- Contact support

---

### 🚚 Driver

Drivers are created and managed by administrators.

Drivers can:

- Log in securely
- View assigned deliveries
- View delivery details
- Accept/manage delivery workflow
- Update shipment status
- Share delivery location
- Upload proof of delivery
- Complete deliveries
- View earnings
- View payout history
- View paid and pending earnings
- Manage driver settings

Drivers cannot be publicly registered through the customer signup system.

---

### 🛠️ Administrator

Administrators have access to the management dashboard.

Admin capabilities include:

#### Dashboard

- Business overview
- Shipment statistics
- Driver statistics
- Customer statistics
- Payment information
- Earnings information

#### Shipments

- View all shipments
- View shipment details
- Manage shipment status
- Assign drivers
- Monitor delivery progress
- View shipment timeline
- View proof of delivery

#### Drivers

- Create drivers
- View drivers
- Edit driver information
- Activate/deactivate drivers
- Suspend drivers
- View driver details
- View driver delivery activity
- View driver earnings

#### Customers

- View customers
- Manage customer accounts
- Activate/deactivate customers
- View customer shipment history

#### Payments

- View customer payments
- Monitor payment status
- Review payment history

#### Driver Earnings

- View all driver earnings
- View individual driver earnings
- View pending payouts
- View paid payouts
- Mark earnings as paid
- Add payment references
- Download driver payout records as CSV
- Generate driver payout statements as PDF

#### Tracking

- Monitor shipment progress
- View shipment status events
- View driver location information

#### Reports

- View operational and financial information

#### Settings

- Company information
- Branding
- Logo and favicon
- Localization
- Currency
- Timezone
- Date/time formatting
- Pricing configuration
- Support information

---

# 📦 Shipment Workflow

A shipment follows a controlled lifecycle.

```text
Pending
   ↓
Approved
   ↓
Picked Up
   ↓
In Transit
   ↓
Arrived at Warehouse
   ↓
Out for Delivery
   ↓
Arrived at Delivery Destination
   ↓
Delivered
```
