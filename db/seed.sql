-- db/seed.sql
-- Sample data for testing

USE freshmongers_db;

-- Insert Suppliers
INSERT INTO suppliers (name, phone, email, location, rating) VALUES
('Kerala Fish Market', '9999999901', 'supplier@keralafishmarket.com', 'Fort Kochi', 4.8),
('Coastal Fisheries', '9999999902', 'info@coastalfisheries.com', 'Kozhikode', 4.6),
('Fresh Waters Co', '9999999903', 'contact@freshwaters.com', 'Thiruvananthapuram', 4.9);

-- Insert Products (Sea Fish)
INSERT INTO products (category_id, supplier_id, name, slug, description, price_per_kg, stock_kg, min_order_kg, freshness_status, harvest_date, is_available) VALUES
(1, 1, 'Salmon', 'salmon', 'Fresh Norwegian Salmon', 450, 50, 0.5, 'super_fresh', CURDATE(), TRUE),
(1, 1, 'Mackerel', 'mackerel', 'Fresh Atlantic Mackerel', 250, 100, 0.5, 'fresh', CURDATE(), TRUE),
(1, 2, 'Tilapia', 'tilapia', 'Fresh Tilapia Fish', 180, 80, 0.5, 'fresh', CURDATE(), TRUE),
(1, 2, 'Pomfret', 'pomfret', 'Premium Pomfret Fish', 320, 60, 0.5, 'super_fresh', CURDATE(), TRUE),
(1, 3, 'Tuna', 'tuna', 'Fresh Yellow Fin Tuna', 380, 40, 1.0, 'super_fresh', CURDATE(), TRUE);

-- Insert Freshwater Fish
INSERT INTO products (category_id, supplier_id, name, slug, description, price_per_kg, stock_kg, min_order_kg, freshness_status, harvest_date, is_available) VALUES
(2, 3, 'Catfish', 'catfish', 'Fresh Catfish', 150, 120, 0.5, 'fresh', CURDATE(), TRUE),
(2, 1, 'Rohu', 'rohu', 'Fresh Rohu Fish', 200, 100, 0.5, 'fresh', CURDATE(), TRUE),
(2, 2, 'Carp', 'carp', 'Fresh Carp Fish', 160, 90, 0.5, 'fresh', CURDATE(), TRUE);

-- Insert Shellfish
INSERT INTO products (category_id, supplier_id, name, slug, description, price_per_kg, stock_kg, min_order_kg, freshness_status, harvest_date, is_available) VALUES
(3, 1, 'Shrimp', 'shrimp', 'Fresh River Shrimp', 600, 30, 0.25, 'super_fresh', CURDATE(), TRUE),
(3, 2, 'Crab', 'crab', 'Fresh Mud Crab', 800, 20, 0.5, 'super_fresh', CURDATE(), TRUE),
(3, 3, 'Mussels', 'mussels', 'Fresh Mussels', 180, 50, 0.5, 'fresh', CURDATE(), TRUE);

-- Insert Sample Customer
INSERT INTO customers (phone, email, name, avatar_url) VALUES
('9999999999', 'customer@example.com', 'John Doe', NULL);

-- Insert Sample Address
INSERT INTO addresses (customer_id, type, name, phone, street, city, state, pincode, is_default) VALUES
(1, 'home', 'Home', '9999999999', '123 Main Street, Apt 4', 'Thiruvananthapuram', 'Kerala', '695001', TRUE),
(1, 'work', 'Office', '9999999999', '456 Office Boulevard', 'Thiruvananthapuram', 'Kerala', '695002', FALSE);

-- Insert Sample Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, valid_from, valid_till, is_active) VALUES
('FRESH30', 'percentage', 30, 500, 300, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE),
('FIRST100', 'fixed', 100, 1000, 100, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), TRUE),
('WELCOME50', 'fixed', 50, 300, 50, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), TRUE);

-- Insert Admin User (password: admin123)
INSERT INTO admin_users (phone, email, name, role, password_hash, is_active) VALUES
('9000000001', 'admin@freshmongers.com', 'Admin User', 'admin', '$2a$10$YIjlrVyqxlvCm7xvLxdJwuC0xL2Vu2c5.U7vN7d8K9L2H6Q9c3K1S', TRUE);

-- Insert Admin Moderator
INSERT INTO admin_users (phone, email, name, role, password_hash, is_active) VALUES
('9000000002', 'moderator@freshmongers.com', 'Moderator', 'moderator', '$2a$10$YIjlrVyqxlvCm7xvLxdJwuC0xL2Vu2c5.U7vN7d8K9L2H6Q9c3K1S', TRUE);
