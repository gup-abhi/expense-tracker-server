DROP TABLE IF EXISTS users cascade;
DROP TABLE IF EXISTS categories cascade;
DROP TABLE IF EXISTS expenses cascade;
DROP TABLE IF EXISTS currencies cascade;

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

--Expenses Table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    expense VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    username VARCHAR(50) REFERENCES users(username)
);

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
INSERT INTO categories (category_name) VALUES ('Miscellaneous');

--Insert some currencies
INSERT INTO currencies (currency_code, currency_name) VALUES ('USD', 'United States Dollar');
INSERT INTO currencies (currency_code, currency_name) VALUES ('CAD', 'Canadian Dollar');
INSERT INTO currencies (currency_code, currency_name) VALUES ('EUR', 'Euro');
INSERT INTO currencies (currency_code, currency_name) VALUES ('GBP', 'British Pound');
INSERT INTO currencies (currency_code, currency_name) VALUES ('JPY', 'Japanese Yen');