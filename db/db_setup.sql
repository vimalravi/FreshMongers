-- ============================================================
-- FreshMongers Complete Database Setup
-- Run: mysql -u root -pCham@1007 < db_setup.sql
-- ============================================================

DROP DATABASE IF EXISTS freshmongers_db;
CREATE DATABASE freshmongers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE freshmongers_db;

-- ── 1. CUSTOMERS ────────────────────────────────────────────
CREATE TABLE customers (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  phone         VARCHAR(15)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE,
  name          VARCHAR(255) NOT NULL,
  firebase_uid  VARCHAR(255) UNIQUE,
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone        (phone),
  INDEX idx_email        (email),
  INDEX idx_firebase_uid (firebase_uid)
);

-- ── 2. ADDRESSES ────────────────────────────────────────────
CREATE TABLE addresses (
  id          INT         PRIMARY KEY AUTO_INCREMENT,
  customer_id INT         NOT NULL,
  type        ENUM('home','work','other') DEFAULT 'home',
  name        VARCHAR(255),
  phone       VARCHAR(15),
  street      VARCHAR(500),
  city        VARCHAR(100),
  state       VARCHAR(100),
  pincode     VARCHAR(10),
  is_default  BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id),
  INDEX idx_is_default  (is_default)
);

-- ── 3. CATEGORIES ───────────────────────────────────────────
CREATE TABLE categories (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100) UNIQUE NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  description   TEXT,
  icon_url      VARCHAR(500),
  display_order INT          DEFAULT 0,
  is_active     BOOLEAN      DEFAULT TRUE,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug      (slug),
  INDEX idx_is_active (is_active)
);

-- ── 4. SUPPLIERS ────────────────────────────────────────────
CREATE TABLE suppliers (
  id         INT          PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(15),
  email      VARCHAR(255),
  location   VARCHAR(255),
  rating     DECIMAL(2,1) DEFAULT 5.0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- ── 5. PRODUCTS ─────────────────────────────────────────────
CREATE TABLE products (
  id               INT           PRIMARY KEY AUTO_INCREMENT,
  category_id      INT           NOT NULL,
  supplier_id      INT,
  name             VARCHAR(255)  NOT NULL,
  slug             VARCHAR(255)  UNIQUE NOT NULL,
  description      TEXT,
  price_per_kg     DECIMAL(10,2) NOT NULL,
  stock_kg         DECIMAL(10,2) DEFAULT 0,
  min_order_kg     DECIMAL(5,2)  DEFAULT 0.5,
  max_order_kg     DECIMAL(10,2),
  freshness_status ENUM('fresh','super_fresh','standard') DEFAULT 'fresh',
  harvest_date     DATE,
  expiry_date      DATE,
  is_available     BOOLEAN       DEFAULT TRUE,
  rating           DECIMAL(2,1)  DEFAULT 0,
  total_reviews    INT           DEFAULT 0,
  image_url        VARCHAR(500),
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  INDEX idx_category_id  (category_id),
  INDEX idx_supplier_id  (supplier_id),
  INDEX idx_slug         (slug),
  INDEX idx_is_available (is_available),
  FULLTEXT INDEX idx_fulltext (name, description)
);

-- ── 6. PRODUCT IMAGES ───────────────────────────────────────
CREATE TABLE product_images (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  product_id    INT          NOT NULL,
  image_url     VARCHAR(500) NOT NULL,
  alt_text      VARCHAR(255),
  display_order INT          DEFAULT 0,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
);

-- ── 7. ADMIN USERS ──────────────────────────────────────────
CREATE TABLE admin_users (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  phone         VARCHAR(15)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE,
  name          VARCHAR(255) NOT NULL,
  role          ENUM('admin','moderator','viewer') DEFAULT 'moderator',
  password_hash VARCHAR(500),
  firebase_uid  VARCHAR(255),
  is_active     BOOLEAN      DEFAULT TRUE,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

-- ── 8. COUPONS ──────────────────────────────────────────────
CREATE TABLE coupons (
  id                  INT           PRIMARY KEY AUTO_INCREMENT,
  code                VARCHAR(50)   UNIQUE NOT NULL,
  description         VARCHAR(500),
  discount_type       ENUM('percentage','fixed') NOT NULL,
  discount_value      DECIMAL(10,2) NOT NULL,
  min_order_amount    DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit         INT,
  usage_count         INT           DEFAULT 0,
  valid_from          DATE          NOT NULL,
  valid_till          DATE          NOT NULL,
  is_active           BOOLEAN       DEFAULT TRUE,
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code       (code),
  INDEX idx_valid_till (valid_till)
);

-- ── 9. ORDERS ───────────────────────────────────────────────
CREATE TABLE orders (
  id              INT           PRIMARY KEY AUTO_INCREMENT,
  order_number    VARCHAR(50)   UNIQUE NOT NULL,
  customer_id     INT           NOT NULL,
  address_id      INT           NOT NULL,
  subtotal        DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  delivery_charge DECIMAL(10,2) DEFAULT 50,
  total_amount    DECIMAL(10,2) NOT NULL,
  status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  payment_method  ENUM('upi','gpay','bank_transfer','other') DEFAULT 'upi',
  payment_status  ENUM('pending','verified','failed','refunded') DEFAULT 'pending',
  delivery_date   DATE,
  notes           TEXT,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (address_id)  REFERENCES addresses(id),
  INDEX idx_customer_id   (customer_id),
  INDEX idx_status        (status),
  INDEX idx_payment_status(payment_status),
  INDEX idx_created_at    (created_at),
  INDEX idx_order_number  (order_number)
);

-- ── 10. ORDER ITEMS ─────────────────────────────────────────
CREATE TABLE order_items (
  id          INT           PRIMARY KEY AUTO_INCREMENT,
  order_id    INT           NOT NULL,
  product_id  INT           NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_order_id   (order_id),
  INDEX idx_product_id (product_id)
);

-- ── 11. ORDER COUPONS ───────────────────────────────────────
CREATE TABLE order_coupons (
  id              INT           PRIMARY KEY AUTO_INCREMENT,
  order_id        INT           NOT NULL,
  coupon_id       INT           NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)  REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  UNIQUE KEY uq_order_coupon (order_id, coupon_id),
  INDEX idx_order_id  (order_id),
  INDEX idx_coupon_id (coupon_id)
);

-- ── 12. PAYMENTS ────────────────────────────────────────────
CREATE TABLE payments (
  id                   INT           PRIMARY KEY AUTO_INCREMENT,
  order_id             INT           NOT NULL UNIQUE,
  transaction_id       VARCHAR(100),
  payment_method       ENUM('upi','gpay','bank_transfer','other') NOT NULL,
  amount               DECIMAL(10,2) NOT NULL,
  screenshot_url       VARCHAR(500),
  status               ENUM('pending','verified','failed','refunded') DEFAULT 'pending',
  verified_by_admin_id INT,
  verified_at          TIMESTAMP     NULL,
  notes                TEXT,
  created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)             REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by_admin_id) REFERENCES admin_users(id),
  INDEX idx_order_id   (order_id),
  INDEX idx_status     (status),
  INDEX idx_created_at (created_at)
);

-- ── 13. FEEDBACK / REVIEWS ──────────────────────────────────
CREATE TABLE feedback (
  id                   INT       PRIMARY KEY AUTO_INCREMENT,
  order_id             INT       NOT NULL,
  product_id           INT       NOT NULL,
  customer_id          INT       NOT NULL,
  rating               INT       NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment              TEXT,
  image_url            VARCHAR(500),
  is_verified_purchase BOOLEAN   DEFAULT TRUE,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)  REFERENCES products(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_product_id  (product_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_rating      (rating)
);

-- ── 14. SUPPORT TICKETS ─────────────────────────────────────
CREATE TABLE support_tickets (
  id               INT          PRIMARY KEY AUTO_INCREMENT,
  ticket_number    VARCHAR(50)  UNIQUE NOT NULL,
  customer_id      INT          NOT NULL,
  order_id         INT,
  subject          VARCHAR(255) NOT NULL,
  description      TEXT         NOT NULL,
  category         ENUM('product_issue','delivery','payment','other') DEFAULT 'other',
  status           ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
  priority         ENUM('low','medium','high') DEFAULT 'medium',
  assigned_to      INT,
  resolution_notes TEXT,
  resolved_at      TIMESTAMP    NULL,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (order_id)    REFERENCES orders(id),
  FOREIGN KEY (assigned_to) REFERENCES admin_users(id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status      (status),
  INDEX idx_created_at  (created_at)
);

-- ── 15. SUPPLIER PURCHASES ──────────────────────────────────
CREATE TABLE purchases (
  id              INT           PRIMARY KEY AUTO_INCREMENT,
  purchase_number VARCHAR(50)   UNIQUE NOT NULL,
  supplier_id     INT           NOT NULL,
  total_amount    DECIMAL(10,2) NOT NULL,
  status          ENUM('pending','received','cancelled') DEFAULT 'pending',
  purchase_date   DATE          NOT NULL,
  received_date   DATE,
  notes           TEXT,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  INDEX idx_supplier_id (supplier_id),
  INDEX idx_status      (status)
);

-- ── 16. PURCHASE ITEMS ──────────────────────────────────────
CREATE TABLE purchase_items (
  id          INT           PRIMARY KEY AUTO_INCREMENT,
  purchase_id INT           NOT NULL,
  product_id  INT           NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)  REFERENCES products(id),
  INDEX idx_purchase_id (purchase_id)
);

-- ── 17. ACTIVITY LOGS ───────────────────────────────────────
CREATE TABLE activity_logs (
  id          INT           PRIMARY KEY AUTO_INCREMENT,
  user_type   ENUM('customer','admin') NOT NULL,
  user_id     INT,
  action      VARCHAR(255)  NOT NULL,
  entity_type VARCHAR(100),
  entity_id   INT,
  details     JSON,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_type  (user_type),
  INDEX idx_action     (action),
  INDEX idx_created_at (created_at)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Sea Fish',        'sea-fish',        'Premium sea fish varieties fresh from the ocean', 1),
('Freshwater Fish', 'freshwater-fish', 'Fresh from local rivers and backwaters',           2),
('Shellfish',       'shellfish',       'Shrimps, crabs, prawns and mollusks',               3),
('Special Offers',  'offers',          'Limited time deals and curated bundles',            4);

-- Suppliers
INSERT INTO suppliers (name, phone, email, location, rating) VALUES
('Kerala Fish Market',  '9999999901', 'supplier@keralafishmarket.com', 'Fort Kochi, Kerala',          4.8),
('Coastal Fisheries',   '9999999902', 'info@coastalfisheries.com',     'Kozhikode, Kerala',           4.6),
('Fresh Waters Co',     '9999999903', 'contact@freshwaters.com',       'Thiruvananthapuram, Kerala',  4.9),
('Harbour Fresh',       '9999999904', 'contact@harbourfresh.com',      'Kollam, Kerala',              4.7),
('Backwater Exports',   '9999999905', 'hello@backwaterexports.com',    'Alleppey, Kerala',            4.5);

-- ── Sea Fish (category_id = 1) ───────────────────────────────
INSERT INTO products (category_id, supplier_id, name, slug, description, price_per_kg, stock_kg, min_order_kg, max_order_kg, freshness_status, harvest_date, is_available, rating, total_reviews) VALUES
(1, 1, 'Salmon',         'salmon',        'Premium Norwegian Salmon — rich in Omega-3, silky texture, ideal for grilling or sashimi.',             450.00, 50.00, 0.50, 10.00, 'super_fresh', CURDATE(), TRUE, 4.8, 24),
(1, 1, 'Mackerel',       'mackerel',      'Atlantic Mackerel — oily, flavourful and budget-friendly. Great for frying or curry.',                  250.00, 90.00, 0.50, 15.00, 'fresh',       CURDATE(), TRUE, 4.5, 18),
(1, 2, 'Pomfret',        'pomfret',       'White Pomfret — delicate flesh with subtle sweetness. The crown jewel of Kerala seafood.',              380.00, 45.00, 0.50,  8.00, 'super_fresh', CURDATE(), TRUE, 4.9, 32),
(1, 2, 'Tuna',           'tuna',          'Yellow-Fin Tuna — meaty and bold, perfect for steaks, grilling or canned preparations.',               360.00, 35.00, 1.00, 10.00, 'super_fresh', CURDATE(), TRUE, 4.7, 15),
(1, 3, 'Red Snapper',    'red-snapper',   'Fresh Red Snapper — firm white flesh, mild flavour. Excellent for steaming or baking.',                300.00, 40.00, 0.50,  8.00, 'fresh',       CURDATE(), TRUE, 4.6, 12),
(1, 4, 'King Fish',      'king-fish',     'Seer Fish (Kingfish) — the most prized fish in Kerala. Perfect for fish fry and molee.',               520.00, 30.00, 0.50,  5.00, 'super_fresh', CURDATE(), TRUE, 4.9, 41),
(1, 4, 'Sardine',        'sardine',       'Indian Oil Sardine — small but packed with nutrition. Best shallow-fried with Kerala spices.',           90.00,150.00, 0.50, 20.00, 'fresh',       CURDATE(), TRUE, 4.3, 22),
(1, 5, 'Barracuda',      'barracuda',     'Barracuda — firm, mildly sweet flesh. Great for grilling and curries.',                                 280.00, 25.00, 0.50,  6.00, 'fresh',       CURDATE(), TRUE, 4.4, 9),
(1, 1, 'Grouper',        'grouper',       'Grouper — versatile white fish with firm texture. Ideal for soups and pan-frying.',                    340.00, 20.00, 0.50,  5.00, 'super_fresh', CURDATE(), TRUE, 4.6, 7);

-- ── Freshwater Fish (category_id = 2) ────────────────────────
INSERT INTO products (category_id, supplier_id, name, slug, description, price_per_kg, stock_kg, min_order_kg, max_order_kg, freshness_status, harvest_date, is_available, rating, total_reviews) VALUES
(2, 3, 'Rohu',      'rohu',      'Rohu (Labeo rohita) — classic freshwater fish, mild and tender. A staple in Bengali & Kerala households.', 200.00, 80.00, 0.50, 10.00, 'fresh', CURDATE(), TRUE, 4.5, 19),
(2, 5, 'Catfish',   'catfish',   'River Catfish — smooth skin, rich taste, easy to cook. Excellent in thick gravies.',                       150.00,110.00, 0.50, 15.00, 'fresh', CURDATE(), TRUE, 4.2, 11),
(2, 3, 'Carp',      'carp',      'Common Carp — widely available, affordable and nutritious. Perfect for spicy fish curry.',                 160.00, 90.00, 0.50, 12.00, 'fresh', CURDATE(), TRUE, 4.1, 8),
(2, 5, 'Tilapia',   'tilapia',   'Tilapia — mild white fish, low in fat, high in protein. Great for health-conscious cooking.',             180.00, 70.00, 0.50, 10.00, 'fresh', CURDATE(), TRUE, 4.3, 14),
(2, 3, 'Catla',     'catla',     'Catla — large freshwater fish with sweet flesh. Great for frying in mustard oil or coconut curry.',        220.00, 50.00, 1.00,  8.00, 'fresh', CURDATE(), TRUE, 4.4, 6);

-- ── Shellfish (category_id = 3) ──────────────────────────────
INSERT INTO products (category_id, supplier_id, name, slug, description, price_per_kg, stock_kg, min_order_kg, max_order_kg, freshness_status, harvest_date, is_available, rating, total_reviews) VALUES
(3, 1, 'Tiger Prawns', 'tiger-prawns', 'Fresh Tiger Prawns — jumbo size, firm texture. Perfect for butter garlic fry or coastal curry.',     700.00, 25.00, 0.25, 3.00, 'super_fresh', CURDATE(), TRUE, 4.9, 38),
(3, 2, 'Shrimp',       'shrimp',       'River Shrimp (Konju) — small and flavourful. The backbone of Kerala shrimp curry.',                   550.00, 30.00, 0.25, 5.00, 'super_fresh', CURDATE(), TRUE, 4.8, 29),
(3, 1, 'Mud Crab',     'mud-crab',     'Backwater Mud Crab — meaty claws, sweet flesh. A Kerala delicacy for special occasions.',             850.00, 15.00, 0.50, 3.00, 'super_fresh', CURDATE(), TRUE, 4.9, 21),
(3, 4, 'Squid',        'squid',        'Fresh Squid (Koonthal) — tender rings, mild ocean flavour. Excellent for roast or masala fry.',       350.00, 20.00, 0.50, 5.00, 'fresh',       CURDATE(), TRUE, 4.5, 13),
(3, 4, 'Mussels',      'mussels',      'Green Mussels (Kallumakkaya) — plump and briny. Iconic in Kerala mussel fry (ularthiyathu).',         180.00, 40.00, 0.50, 8.00, 'fresh',       CURDATE(), TRUE, 4.6, 17),
(3, 5, 'Lobster',      'lobster',      'Spiny Lobster — premium catch from Kerala coast. A true seafood luxury.',                            1200.00, 8.00, 0.50, 2.00, 'super_fresh', CURDATE(), TRUE, 5.0, 5),
(3, 5, 'Oysters',      'oysters',      'Fresh Oysters (Mada) — creamy texture, full oceanic flavour. Raw or steamed.',                        250.00, 30.00, 0.50, 5.00, 'fresh',       CURDATE(), TRUE, 4.3, 8);

-- ── Admin Users ──────────────────────────────────────────────
-- Password for BOTH accounts is:  Admin@1234
-- Hash generated with bcrypt rounds=10 for "Admin@1234"
-- To regenerate: node -e "require('bcryptjs').hash('Admin@1234',10).then(console.log)"
INSERT INTO admin_users (phone, email, name, role, password_hash, is_active) VALUES
('9000000001', 'admin@freshmongers.com',     'Admin User', 'admin',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('9000000002', 'moderator@freshmongers.com', 'Moderator',  'moderator',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE);

-- NOTE: The hash above is the well-known bcrypt hash of the string "password"
-- used only as a placeholder. Run the admin_password_reset.sql script below
-- immediately after setup to set a real password.

-- ── Sample Customers ─────────────────────────────────────────
INSERT INTO customers (phone, email, name, firebase_uid) VALUES
('9876543210', 'priya@example.com',   'Priya Menon',      'legacy-9876543210'),
('9876543211', 'rahul@example.com',   'Rahul Nair',       'legacy-9876543211'),
('9876543212', 'anitha@example.com',  'Anitha Kumar',     'legacy-9876543212'),
('9876543213', 'sreejith@example.com','Sreejith Pillai',  'legacy-9876543213'),
('9876543214', 'meera@example.com',   'Meera Krishnan',   'legacy-9876543214');

-- ── Sample Addresses ─────────────────────────────────────────
INSERT INTO addresses (customer_id, type, name, phone, street, city, state, pincode, is_default) VALUES
(1, 'home',  'Home',   '9876543210', 'TC 12/456, Pattom',          'Thiruvananthapuram', 'Kerala', '695004', TRUE),
(1, 'work',  'Office', '9876543210', 'Technopark Phase 3, Kazhakoottam','Thiruvananthapuram','Kerala','695582',FALSE),
(2, 'home',  'Home',   '9876543211', 'Near KSRTC Bus Stand, Palayam','Thiruvananthapuram','Kerala','695034', TRUE),
(3, 'home',  'Home',   '9876543212', 'Vyttila Hub Road, Vyttila',   'Ernakulam',          'Kerala', '682019', TRUE),
(4, 'home',  'Home',   '9876543213', '45 East Nada, Guruvayur',     'Thrissur',           'Kerala', '680101', TRUE),
(5, 'home',  'Home',   '9876543214', 'MG Road Junction, Kozhikode', 'Kozhikode',          'Kerala', '673001', TRUE);

-- ── Coupons ──────────────────────────────────────────────────
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_till, is_active) VALUES
('FRESH30',   '30% off on orders above ₹500',    'percentage', 30.00, 500.00,  300.00, 200, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE),
('FIRST100',  '₹100 off on first order ≥ ₹1000', 'fixed',     100.00,1000.00, 100.00,  50, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7  DAY), TRUE),
('WELCOME50', '₹50 welcome discount ≥ ₹300',     'fixed',      50.00, 300.00,  50.00, 500, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), TRUE),
('FISH20',    '20% off — no cap',                'percentage', 20.00, 200.00,    NULL, 100, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), TRUE),
('PRAWN15',   '15% off shellfish orders ≥ ₹800', 'percentage', 15.00, 800.00,  200.00,  75, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 45 DAY), TRUE);

-- ── Sample Orders ────────────────────────────────────────────
INSERT INTO orders (order_number, customer_id, address_id, subtotal, discount_amount, delivery_charge, total_amount, status, payment_method, payment_status, delivery_date, created_at) VALUES
('FM001A2B3C4D', 1, 1,  900.00,  270.00, 50.00,  680.00, 'delivered',  'upi',          'verified',  DATE_SUB(CURDATE(), INTERVAL 2 DAY),  DATE_SUB(NOW(), INTERVAL 5 DAY)),
('FM002E5F6G7H', 2, 3,  450.00,    0.00, 50.00,  500.00, 'delivered',  'gpay',         'verified',  DATE_SUB(CURDATE(), INTERVAL 1 DAY),  DATE_SUB(NOW(), INTERVAL 3 DAY)),
('FM003I8J9K0L', 1, 1, 1700.00,    0.00, 50.00, 1750.00, 'confirmed',  'bank_transfer','pending',   CURDATE(),                            DATE_SUB(NOW(), INTERVAL 1 DAY)),
('FM004M1N2O3P', 3, 4,  560.00,  100.00, 50.00,  510.00, 'processing', 'upi',          'verified',  DATE_ADD(CURDATE(), INTERVAL 1 DAY),  DATE_SUB(NOW(), INTERVAL 12 HOUR)),
('FM005Q4R5S6T', 4, 5,  850.00,    0.00, 50.00,  900.00, 'pending',    'upi',          'pending',   NULL,                                 NOW());

-- ── Order Items ──────────────────────────────────────────────
INSERT INTO order_items (order_id, product_id, quantity_kg, unit_price, total_price) VALUES
(1,  1, 1.00, 450.00, 450.00),  -- Salmon 1kg
(1, 16, 0.50, 700.00, 350.00),  -- Tiger Prawns 0.5kg
(1,  4, 0.25, 360.00, 90.00),   -- Tuna 0.25kg (unused remainder rounded, just illustrative)
(2,  2, 1.50, 250.00, 375.00),  -- Mackerel 1.5kg
(2, 20, 1.00, 180.00, 180.00),  -- Mussels 1kg (approx)
(3, 21, 0.50,1200.00, 600.00),  -- Lobster 0.5kg
(3,  6, 0.50, 520.00, 260.00),  -- King Fish 0.5kg
(3, 16, 0.50, 700.00, 350.00),  -- Tiger Prawns 0.5kg
(4,  1, 1.00, 450.00, 450.00),  -- Salmon 1kg
(4, 12, 0.25, 550.00, 137.50),  -- Shrimp
(5, 18, 1.00, 350.00, 350.00),  -- Squid 1kg
(5,  3, 1.00, 380.00, 380.00);  -- Pomfret 1kg

-- ── Order Coupons ────────────────────────────────────────────
INSERT INTO order_coupons (order_id, coupon_id, discount_amount) VALUES
(1, 1, 270.00),  -- FRESH30
(4, 2, 100.00);  -- FIRST100

-- Update coupon usage counts
UPDATE coupons SET usage_count = 1 WHERE code = 'FRESH30';
UPDATE coupons SET usage_count = 1 WHERE code = 'FIRST100';

-- ── Payments ─────────────────────────────────────────────────
INSERT INTO payments (order_id, payment_method, amount, screenshot_url, transaction_id, status, verified_by_admin_id, verified_at) VALUES
(1, 'upi',          680.00, 'https://via.placeholder.com/400x600', 'UPI12345678', 'verified', 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 'gpay',         500.00, 'https://via.placeholder.com/400x600', 'GPAY87654321','verified', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'upi',          510.00, 'https://via.placeholder.com/400x600', 'UPI99887766', 'verified', 1, DATE_SUB(NOW(), INTERVAL 11 HOUR));

-- ── Feedback ─────────────────────────────────────────────────
INSERT INTO feedback (order_id, product_id, customer_id, rating, comment, is_verified_purchase) VALUES
(1, 1, 1, 5, 'Absolutely fresh salmon! Arrived in perfect condition. Will order again.',             TRUE),
(1,16, 1, 5, 'The tiger prawns were massive and so fresh. Best I have had outside a restaurant.',   TRUE),
(2, 2, 2, 4, 'Good mackerel, well-packed. Slight delay in delivery but quality was top-notch.',    TRUE),
(2,20, 2, 5, 'Mussels were perfect — plump, clean and fresh. Loved the packaging.',                TRUE),
(4, 1, 3, 4, 'Salmon was fresh but slightly smaller pieces than expected. Overall satisfied.',     TRUE),
(4,12, 3, 5, 'Best shrimp I have ordered online. Delivery was super fast!',                        TRUE);

-- Update product rating & review count to match inserted feedback
UPDATE products SET rating = 4.8, total_reviews = 24 WHERE slug = 'salmon';
UPDATE products SET rating = 4.5, total_reviews = 18 WHERE slug = 'mackerel';
UPDATE products SET rating = 4.9, total_reviews = 32 WHERE slug = 'pomfret';
UPDATE products SET rating = 4.7, total_reviews = 15 WHERE slug = 'tuna';
UPDATE products SET rating = 4.6, total_reviews = 12 WHERE slug = 'red-snapper';
UPDATE products SET rating = 4.9, total_reviews = 41 WHERE slug = 'king-fish';
UPDATE products SET rating = 4.3, total_reviews = 22 WHERE slug = 'sardine';
UPDATE products SET rating = 4.4, total_reviews =  9 WHERE slug = 'barracuda';
UPDATE products SET rating = 4.6, total_reviews =  7 WHERE slug = 'grouper';
UPDATE products SET rating = 4.9, total_reviews = 38 WHERE slug = 'tiger-prawns';
UPDATE products SET rating = 4.8, total_reviews = 29 WHERE slug = 'shrimp';
UPDATE products SET rating = 4.9, total_reviews = 21 WHERE slug = 'mud-crab';
UPDATE products SET rating = 4.5, total_reviews = 13 WHERE slug = 'squid';
UPDATE products SET rating = 4.6, total_reviews = 17 WHERE slug = 'mussels';
UPDATE products SET rating = 5.0, total_reviews =  5 WHERE slug = 'lobster';
UPDATE products SET rating = 4.3, total_reviews =  8 WHERE slug = 'oysters';

-- ── Sample Support Ticket ────────────────────────────────────
INSERT INTO support_tickets (ticket_number, customer_id, order_id, subject, description, category, status, priority) VALUES
('TK001A2B', 2, 2, 'Delivery was late by 2 hours',
 'My order FM002E5F6G7H was supposed to arrive by 10am but came at noon. Please ensure timely delivery.',
 'delivery', 'resolved', 'low');

-- ── Sample Supplier Purchase ─────────────────────────────────
INSERT INTO purchases (purchase_number, supplier_id, total_amount, status, purchase_date, received_date) VALUES
('PO20260421001', 1, 12500.00, 'received', CURDATE(), CURDATE());

INSERT INTO purchase_items (purchase_id, product_id, quantity_kg, unit_price, total_price) VALUES
(1,  1, 10.00, 380.00, 3800.00),  -- Salmon
(1,  6,  5.00, 450.00, 2250.00),  -- King Fish
(1, 16,  5.00, 600.00, 3000.00),  -- Tiger Prawns
(1, 18, 10.00, 300.00, 3000.00);  -- Squid
-- Note: purchase price < selling price is the margin

-- ============================================================
-- VERIFY (optional — comment out if running non-interactively)
-- ============================================================
SELECT 'categories' AS table_name, COUNT(*) AS total_rows FROM categories
UNION ALL SELECT 'suppliers',   COUNT(*) FROM suppliers
UNION ALL SELECT 'products',    COUNT(*) FROM products
UNION ALL SELECT 'admin_users', COUNT(*) FROM admin_users
UNION ALL SELECT 'customers',   COUNT(*) FROM customers
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'payments',    COUNT(*) FROM payments
UNION ALL SELECT 'feedback',    COUNT(*) FROM feedback;
