DROP TABLE IF EXISTS users cascade;
DROP TABLE IF EXISTS categories cascade;
DROP TABLE IF EXISTS currencies cascade;
DROP TABLE IF EXISTS transactions cascade;
DROP TABLE IF EXISTS transaction_types cascade;
DROP TABLE IF EXISTS payment_methods cascade;

--Currencies Table
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    currency_code CHAR(3) UNIQUE NOT NULL,
    currency_name VARCHAR(50) NOT NULL
);

--Users Table
CREATE TABLE users (
    -- user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    currency_id INTEGER REFERENCES currencies(id) 
);

--Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL
);

-- Create a new transaction_types table
CREATE TABLE transaction_types (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) UNIQUE NOT NULL
);

-- Create a new payment_methods table
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    method VARCHAR(50) UNIQUE NOT NULL
);

-- Create a new expenses table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    username VARCHAR(50) REFERENCES users(username),
    transaction_type_id INTEGER REFERENCES transaction_types(id),
    payment_method_id INTEGER REFERENCES payment_methods(id)
);

-- Insert Default transaction types
INSERT INTO transaction_types (type) VALUES ('Income');
INSERT INTO transaction_types (type) VALUES ('Expense');
INSERT INTO transaction_types (type) VALUES ('Transfer');
INSERT INTO transaction_types (type) VALUES ('Investment');
INSERT INTO transaction_types (type) VALUES ('Loan');
INSERT INTO transaction_types (type) VALUES ('Reimbursement');
INSERT INTO transaction_types (type) VALUES ('Gift');


-- Insert Default payment methods
INSERT INTO payment_methods (method) VALUES ('Credit');
INSERT INTO payment_methods (method) VALUES ('Debit');
INSERT INTO payment_methods (method) VALUES ('Cash');
INSERT INTO payment_methods (method) VALUES ('Check');
INSERT INTO payment_methods (method) VALUES ('Mobile Payment');
INSERT INTO payment_methods (method) VALUES ('Wire Transfer');
INSERT INTO payment_methods (method) VALUES ('Cryptocurrency');

--Insert Default categories
INSERT INTO categories (category_name) VALUES ('Groceries');
INSERT INTO categories (category_name) VALUES ('Rent/Mortgage');
INSERT INTO categories (category_name) VALUES ('Utilities');
INSERT INTO categories (category_name) VALUES ('Transportation');
INSERT INTO categories (category_name) VALUES ('Dining Out');
INSERT INTO categories (category_name) VALUES ('Entertainment');
INSERT INTO categories (category_name) VALUES ('Healthcare');
INSERT INTO categories (category_name) VALUES ('Personal Care');
INSERT INTO categories (category_name) VALUES ('Clothing');
INSERT INTO categories (category_name) VALUES ('Savings & Investments');
INSERT INTO categories (category_name) VALUES ('Salary');
INSERT INTO categories (category_name) VALUES ('Freelance');
INSERT INTO categories (category_name) VALUES ('Investment Returns');
INSERT INTO categories (category_name) VALUES ('Gifts');
INSERT INTO categories (category_name) VALUES ('Other Income');
INSERT INTO categories (category_name) VALUES ('Miscellaneous');

--Insert some currencies
INSERT INTO currencies (currency_code, currency_name) VALUES ('USD', 'United States Dollar');
INSERT INTO currencies (currency_code, currency_name) VALUES ('CAD', 'Canadian Dollar');
INSERT INTO currencies (currency_code, currency_name) VALUES ('EUR', 'Euro');
INSERT INTO currencies (currency_code, currency_name) VALUES ('GBP', 'British Pound');
INSERT INTO currencies (currency_code, currency_name) VALUES ('JPY', 'Japanese Yen');