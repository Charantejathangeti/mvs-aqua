-- MVS Aqua Database Schema
-- Run this on your MySQL/MariaDB database

CREATE DATABASE IF NOT EXISTS mvs_aqua CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mvs_aqua;

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category ENUM('fish','plants','accessories','food','corals','other') NOT NULL DEFAULT 'fish',
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock INT NOT NULL DEFAULT 0,
  emoji VARCHAR(10),
  image VARCHAR(500),
  description TEXT,
  care TEXT,
  featured TINYINT(1) DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(30) PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
  notes TEXT,
  tracking_number VARCHAR(100),
  courier VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(30) NOT NULL,
  product_id INT,
  product_name VARCHAR(150),
  price DECIMAL(10,2),
  qty INT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(30) PRIMARY KEY,
  order_id VARCHAR(30),
  customer_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  items JSON,
  subtotal DECIMAL(10,2),
  delivery DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  amount DECIMAL(10,2),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  discount_pct INT DEFAULT 0,
  code VARCHAR(50),
  emoji VARCHAR(10),
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO admin_users (username, password_hash) VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

INSERT INTO products (name, category, price, original_price, stock, emoji, description, care, featured) VALUES
('Betta Fish', 'fish', 120.00, 150.00, 10, '🐟', 'Beautiful Betta fish with vibrant colors. Disease-free, bred in clean environments.', 'Min 5L tank, temp 24-28°C, feed twice daily.', 1),
('Neon Tetra (10pc)', 'fish', 200.00, 250.00, 20, '🐠', 'Schooling fish with electric blue and red stripes.', 'Group of 6+, temp 20-26°C, soft water preferred.', 1),
('Guppy Pair', 'fish', 90.00, NULL, 15, '🐡', 'Beautiful guppy pair, assorted colors.', 'Hardy fish, great for beginners. Temp 22-28°C.', 0),
('Java Fern Plant', 'plants', 80.00, NULL, 5, '🌿', 'Hardy aquatic plant, perfect for any aquarium.', 'Low light, attach to driftwood or rocks.', 1),
('LED Aquarium Light', 'accessories', 450.00, 600.00, 8, '💡', '18W full spectrum LED light, blue/white modes.', 'Timer compatible, 12-24 inch tanks.', 1),
('Aquarium Filter', 'accessories', 350.00, 420.00, 6, '⚙️', 'Canister filter, 800L/hr flow rate.', 'Clean media monthly.', 0),
('Tetra Fish Food', 'food', 95.00, NULL, 20, '🥣', 'Complete nutrition for all tropical fish.', 'Feed small amounts 2-3 times daily.', 0);

INSERT INTO offers (title, description, discount_pct, code, emoji, active) VALUES
('Free Delivery', 'On all orders above ₹500', 0, '', '🚚', 1),
('First Order 20% OFF', 'Get 20% discount on your very first order!', 20, 'FIRST20', '🎁', 1),
('Combo Deal', 'Buy fish + food + accessory and save 15%', 15, 'COMBO15', '📦', 1);
