-- Database DDL Schema for Online Flour Selling System (PostgreSQL)

-- Drop tables if they exist
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS inventories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Roles Table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- 2. Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    reset_token VARCHAR(100),
    reset_token_expiration TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create User-Roles Join Table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. Create Categories Table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Products Table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    brand VARCHAR(50),
    weight VARCHAR(20),
    price DECIMAL(12,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    availability_status VARCHAR(20) NOT NULL DEFAULT 'INSTOCK',
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 6. Create Inventories Table (1-to-1 track product warehouse location and low stock threshold)
CREATE TABLE inventories (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    warehouse_location VARCHAR(100),
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_inventory FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Create Carts Table (1-to-1 per User)
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_cart FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Create Cart Items Table
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- 9. Create Orders Table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Create Order Items Table
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 11. Create Payments Table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 12. Create Deliveries Table
CREATE TABLE deliveries (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT UNIQUE NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_delivery_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Initial Bootstrap Data (Roles and Initial Accounts)
INSERT INTO roles (id, name) VALUES (1, 'ROLE_CUSTOMER');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_ADMIN');

-- Default Administrator Account: admin@flour.rw / admin123
INSERT INTO users (id, email, password, first_name, last_name, phone_number, is_active)
VALUES (1, 'admin@flour.rw', '$2a$10$X5p1zM7i1Yh0gTqIe8bKLOkOveMvBux53Gk22d2bYm63.1WpW23qK', 'System', 'Administrator', '+250780000000', TRUE);

-- Map Admin User to ADMIN and CUSTOMER Roles
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);

-- Default Customer Account: customer@flour.rw / customer123
INSERT INTO users (id, email, password, first_name, last_name, phone_number, is_active)
VALUES (2, 'customer@flour.rw', '$2a$10$b5YqEw1c0zX/c6G99eFf7OrHeg2T7G0Qo12fL7W2Z7b84hV0xL1Pq', 'Jean', 'Mugisha', '+250781234567', TRUE);

INSERT INTO user_roles (user_id, role_id) VALUES (2, 1);

-- Auto-initialize cart for Jean Mugisha
INSERT INTO carts (id, user_id) VALUES (1, 2);

-- Initial Categories
INSERT INTO categories (id, name, description) VALUES (1, 'Wheat Flour', 'Premium ground wheat flours for baking and everyday cooking');
INSERT INTO categories (id, name, description) VALUES (2, 'Maize Flour', 'Top-quality local maize meal (Ubugali) and corn flour');
INSERT INTO categories (id, name, description) VALUES (3, 'Specialty Flour', 'Gluten-free, cassava, sorghum, and millet flours');

-- Initial Products
INSERT INTO products (id, name, description, brand, weight, price, stock_quantity, image_url, availability_status, category_id)
VALUES (1, 'Azania PPF Pure Patent Flour', 'Premium pure patent wheat flour ideal for high quality pastries, breads, and chapati.', 'Azania', '25kg', 19500.00, 150, '/images/azania-ppf.jpg', 'INSTOCK', 1);

INSERT INTO products (id, name, description, brand, weight, price, stock_quantity, image_url, availability_status, category_id)
VALUES (2, 'Azam Home Baking Flour', '100% Super Fine wheat flour, Africa''s No. 1 choice for home baking, mandazi, and chapatis.', 'Azam', '5kg', 4500.00, 120, '/images/azam-wheat-flour.jpg', 'INSTOCK', 1);

INSERT INTO products (id, name, description, brand, weight, price, stock_quantity, image_url, availability_status, category_id)
VALUES (3, 'Kinazi Fine Cassava Flour', 'High quality 100% fine cassava flour processed locally by Kinazi Cassava Plant Ltd for daily meals.', 'Kinazi', '10kg', 9000.00, 80, '/images/kinazi-cassava-flour.jpg', 'INSTOCK', 3);

INSERT INTO products (id, name, description, brand, weight, price, stock_quantity, image_url, availability_status, category_id)
VALUES (4, 'Akubuzimafarine Kawunga Grade 1 Maize Flour', 'Super quality Grade 1 white maize meal (Kawunga) made in Rwanda (Kayonza-Nyamirama) for soft Ubugali.', 'Akubuzimafarine', '25kg', 16500.00, 200, '/images/maize-flour.jpg', 'INSTOCK', 2);

-- Initial Product Inventories
INSERT INTO inventories (product_id, low_stock_threshold, warehouse_location) VALUES (1, 15, 'Kigali Free Zone, Block A');
INSERT INTO inventories (product_id, low_stock_threshold, warehouse_location) VALUES (2, 10, 'Kigali Free Zone, Block A');
INSERT INTO inventories (product_id, low_stock_threshold, warehouse_location) VALUES (3, 10, 'Kigali Free Zone, Block B');
INSERT INTO inventories (product_id, low_stock_threshold, warehouse_location) VALUES (4, 20, 'Kigali Free Zone, Block C');

