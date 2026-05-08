"""
E-Commerce KPI Dashboard Database Schema

Business type:
Small online e-commerce store.

Tables:

1. customers
- id: unique customer ID
- signup_date: when the customer joined
- email: customer email
- lifetime_value: total value of all purchases by that customer

2. products
- id: unique product ID
- name: product name
- category: product category, e.g. Clothing, Electronics, Home, Beauty
- price: product price
- stock: number of units available

3. orders
- id: unique order ID
- customer_id: links each order to a customer
- order_date: date of the order
- total_amount: total value of the order
- status: completed, refunded, cancelled

4. order_items
- id: unique order item ID
- order_id: links item to an order
- product_id: links item to a product
- quantity: number of units purchased
- price: price at time of purchase
"""