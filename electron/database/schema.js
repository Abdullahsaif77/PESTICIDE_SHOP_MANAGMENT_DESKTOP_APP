// electron/database/schema.js

const schema = `
-- ============================================
-- CORE TABLES (Foundation)
-- ============================================

-- Categories (Product classification)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Units of Measurement
CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    abbreviation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products (Main product catalog)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT,
    category_id INTEGER,
    unit_id INTEGER,
    purchase_price REAL NOT NULL DEFAULT 0,
    sale_price REAL NOT NULL DEFAULT 0,
    stock_quantity REAL NOT NULL DEFAULT 0,
    reorder_level REAL DEFAULT 0,
    barcode TEXT UNIQUE,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

-- ============================================
-- WAREHOUSE & INVENTORY TABLES
-- ============================================

-- Warehouses (Storage locations)
CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Batches (Product batches with expiry)
CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    batch_number TEXT NOT NULL,
    purchase_price REAL NOT NULL DEFAULT 0,
    sale_price REAL NOT NULL DEFAULT 0,
    quantity REAL NOT NULL DEFAULT 0,
    expiry_date DATETIME,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(product_id, batch_number)
);

-- Inventory (Stock per warehouse per product)
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    batch_id INTEGER,
    quantity REAL NOT NULL DEFAULT 0,
    reserved_quantity REAL NOT NULL DEFAULT 0,
    min_stock REAL DEFAULT 0,
    max_stock REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
    UNIQUE(product_id, warehouse_id, batch_id)
);

-- Stock Transfers (Between warehouses)
CREATE TABLE IF NOT EXISTS stock_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_number TEXT NOT NULL UNIQUE,
    product_id INTEGER NOT NULL,
    from_warehouse_id INTEGER NOT NULL,
    to_warehouse_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    batch_id INTEGER,
    transferred_by INTEGER,
    status TEXT DEFAULT 'pending', -- pending, completed, cancelled
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
    FOREIGN KEY (transferred_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- CUSTOMER & SUPPLIER TABLES
-- ============================================

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    cnic TEXT UNIQUE,
    credit REAL DEFAULT 0, -- Amount customer owes us (Customer's credit / our receivable)
    debit REAL DEFAULT 0, -- Amount we owe customer (Customer's debit / our payable)
    credit_limit REAL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    cnic TEXT UNIQUE,
    credit REAL DEFAULT 0, -- Amount supplier owes us (Supplier's credit / our receivable)
    debit REAL DEFAULT 0, -- Amount we owe supplier (Supplier's debit / our payable)
    is_active INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PURCHASE TABLES
-- ============================================

-- Purchases (Purchase orders)
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_number TEXT NOT NULL UNIQUE,
    supplier_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    total_amount REAL NOT NULL DEFAULT 0,
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    due_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, completed, cancelled
    payment_method TEXT, -- cash, bank, credit
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Purchase Items
CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    batch_id INTEGER,
    quantity REAL NOT NULL,
    purchase_price REAL NOT NULL DEFAULT 0,
    sale_price REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    expiry_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);

-- ============================================
-- SALES TABLES
-- ============================================

-- Sales (Sales invoices)
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER,
    warehouse_id INTEGER NOT NULL,
    total_amount REAL NOT NULL DEFAULT 0,
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    due_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'completed', -- completed, pending, cancelled
    payment_method TEXT, -- cash, bank, credit
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    batch_id INTEGER,
    quantity REAL NOT NULL,
    sale_price REAL NOT NULL DEFAULT 0,
    purchase_price REAL NOT NULL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);

-- ============================================
-- LEDGER (KHATA) TABLES
-- ============================================

-- Ledger Entries
CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    supplier_id INTEGER,
    entry_type TEXT NOT NULL, -- debit, credit
    amount REAL NOT NULL,
    description TEXT,
    reference_type TEXT, -- sale, purchase, payment, receipt
    reference_id INTEGER,
    balance_after REAL NOT NULL,
    entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CHECK (customer_id IS NOT NULL OR supplier_id IS NOT NULL)
);

-- Payments (Record of payments made/received)
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    supplier_id INTEGER,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL, -- received, paid
    payment_method TEXT, -- cash, bank, credit
    reference_type TEXT, -- sale, purchase, general
    reference_id INTEGER,
    description TEXT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CHECK (customer_id IS NOT NULL OR supplier_id IS NOT NULL)
);

-- ============================================
-- EXPENSE TABLES
-- ============================================

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_number TEXT NOT NULL UNIQUE,
    category_id INTEGER,
    amount REAL NOT NULL,
    description TEXT,
    expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT,
    receipt_image TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- CASH LOCK SYSTEM TABLES
-- ============================================

-- Cash Sessions (Daily cash management)
CREATE TABLE IF NOT EXISTS cash_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_number TEXT NOT NULL UNIQUE,
    opening_amount REAL NOT NULL DEFAULT 0,
    closing_amount REAL DEFAULT 0,
    total_sales REAL DEFAULT 0,
    total_purchases REAL DEFAULT 0,
    total_expenses REAL DEFAULT 0,
    total_withdrawals REAL DEFAULT 0,
    expected_closing_amount REAL DEFAULT 0,
    actual_closing_amount REAL DEFAULT 0,
    difference REAL DEFAULT 0,
    status TEXT DEFAULT 'open', -- open, closed
    opened_by INTEGER,
    closed_by INTEGER,
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opened_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Withdrawals (Cash taken out)
CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cash_session_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    reason TEXT,
    withdrawn_by INTEGER,
    withdrawn_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_session_id) REFERENCES cash_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (withdrawn_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- USERS & SETTINGS TABLES
-- ============================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'staff', -- admin, manager, staff
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Shop Settings
CREATE TABLE IF NOT EXISTS shop_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    shop_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    license_number TEXT,
    gst_number TEXT,
    currency TEXT DEFAULT 'PKR',
    tax_rate REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Warehouses indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_name ON warehouses(name);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batch ON inventory(batch_id);

-- Batches indexes
CREATE INDEX IF NOT EXISTS idx_batches_product ON batches(product_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_batches_is_active ON batches(is_active);

-- Stock transfers indexes
CREATE INDEX IF NOT EXISTS idx_transfers_from_warehouse ON stock_transfers(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_warehouse ON stock_transfers(to_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON stock_transfers(status);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_phone ON suppliers(phone);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_warehouse ON sales(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Sale items indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_batch ON sale_items(batch_id);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_number ON purchases(purchase_number);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_warehouse ON purchases(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- Purchase items indexes
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product ON purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_batch ON purchase_items(batch_id);

-- Ledger indexes
CREATE INDEX IF NOT EXISTS idx_ledger_customer ON ledger(customer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_supplier ON ledger(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entry_date ON ledger(entry_date);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON ledger(reference_type, reference_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- Cash sessions indexes
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_date ON cash_sessions(opened_at);

-- Withdrawals indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_session ON withdrawals(cash_session_id);

-- ============================================
-- SEED DATA (Default records)
-- ============================================

-- Seed default user (username: admin, password: password123)
INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role) 
VALUES (1, 'admin', '$2a$10$X7O2P8N8Wv4U7S4X8y8GSuQO6B2X1uM0.wYmC7Pz2GzK7B7D/vVOW', 'Shop Admin', 'admin');

-- Seed default shop settings
INSERT OR IGNORE INTO shop_settings (
    id,
    shop_name,
    address,
    phone,
    email,
    license_number,
    gst_number,
    currency,
    tax_rate
)
VALUES (
    1,
    'My Pesticide Shop',
    '',
    '',
    '',
    '',
    '',
    'PKR',
    0
);

-- Seed default expense categories
INSERT OR IGNORE INTO expense_categories (id, name, description) VALUES
    (1, 'Rent', 'Shop rent payments'),
    (2, 'Utilities', 'Electricity, water, gas bills'),
    (3, 'Salaries', 'Employee salaries'),
    (4, 'Transport', 'Delivery and transportation costs'),
    (5, 'Marketing', 'Advertising and promotions'),
    (6, 'Maintenance', 'Shop maintenance and repairs'),
    (7, 'Supplies', 'Office and shop supplies'),
    (8, 'Taxes', 'Government taxes and fees'),
    (9, 'Miscellaneous', 'Other expenses');

-- Seed default categories
INSERT OR IGNORE INTO categories (id, name, description) VALUES
    (1, 'Insecticides', 'Insect killing pesticides'),
    (2, 'Herbicides', 'Weed control products'),
    (3, 'Fungicides', 'Fungus control products'),
    (4, 'Rodenticides', 'Rodent control products'),
    (5, 'Fertilizers', 'Plant nutrition products'),
    (6, 'Growth Regulators', 'Plant growth regulators');

-- Seed default units
INSERT OR IGNORE INTO units (id, name, abbreviation) VALUES
    (1, 'Liter', 'L'),
    (2, 'Milliliter', 'mL'),
    (3, 'Kilogram', 'kg'),
    (4, 'Gram', 'g'),
    (5, 'Piece', 'pc'),
    (6, 'Pack', 'pck'),
    (7, 'Bottle', 'btl'),
    (8, 'Bag', 'bag');

-- Seed default warehouse
INSERT OR IGNORE INTO warehouses (id, name, location, status) VALUES
    (1, 'Main Warehouse', 'Ground Floor', 'active');
`;

module.exports = schema;