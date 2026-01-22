// MongoDB initialization script
// This runs when the container is first created

db = db.getSiblingDB('cozeal');

// Create collections with validation
db.createCollection('orders');
db.createCollection('discountcodes');
db.createCollection('invoices');
db.createCollection('settings');
db.createCollection('adminusers');

// Create indexes for better performance
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
db.orders.createIndex({ tapChargeId: 1 });

db.discountcodes.createIndex({ code: 1 }, { unique: true });
db.discountcodes.createIndex({ isActive: 1 });

db.invoices.createIndex({ invoiceNumber: 1 }, { unique: true });
db.invoices.createIndex({ orderId: 1 }, { unique: true });

db.settings.createIndex({ key: 1 }, { unique: true });

db.adminusers.createIndex({ email: 1 }, { unique: true });

print('MongoDB initialized successfully!');
