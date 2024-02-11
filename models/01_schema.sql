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

Alter table users ADD column budget DECIMAL(10, 2);
Alter table users ADD column goal DECIMAL(10, 2);
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT FALSE;

CREATE TABLE user_verification (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE REFERENCES users(username),
    hash VARCHAR(32) NOT NULL -- Storing a 128-bit hash as a VARCHAR(32) for simplicity
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

-- Recurring Expenses Table
CREATE TABLE recurring_expenses (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    next_due_date DATE NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    username VARCHAR(50) REFERENCES users(username),
    transaction_type_id INTEGER REFERENCES transaction_types(id),
    payment_method_id INTEGER REFERENCES payment_methods(id)
);

--Triggers
CREATE OR REPLACE FUNCTION create_verification_hash()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_verification (username, hash)
    VALUES (NEW.username, MD5(NEW.username || NOW()::TEXT));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user(
    username VARCHAR(50),
    password VARCHAR(50),
    email VARCHAR(255),
    currency_id INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO users (username, password, email, currency_id)
    VALUES (username, password, email, currency_id);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_create_user
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_verification_hash();


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