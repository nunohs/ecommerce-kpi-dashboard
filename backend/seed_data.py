"""
seed_data.py

This file creates realistic fake e-commerce data for the dashboard.

It generates customers, products, orders, and order items, then saves them into
the SQLite database.

Simple explanation:
This file fills the store with fake business data so the dashboard has
something to analyse.
"""

from faker import Faker
from random import randint, choice, uniform, sample
from datetime import date, timedelta

from database import Base, engine, SessionLocal
from models import Customer, Product, Order, OrderItem

fake = Faker()

categories = ["Clothing", "Electronics", "Home", "Beauty", "Fitness", "Accessories"]
statuses = ["completed", "completed", "completed", "completed", "refunded", "cancelled"]


def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def create_customers(db, count=500):
    customers = []

    for _ in range(count):
        customer = Customer(
            signup_date=date.today() - timedelta(days=randint(1, 180)),
            email=fake.unique.email(),
            lifetime_value=0
        )
        customers.append(customer)

    db.add_all(customers)
    db.commit()
    return customers


def create_products(db, count=100):
    products = []

    for _ in range(count):
        price = round(uniform(15, 250), 2)

        product = Product(
            name=fake.word().title() + " " + choice(["Pro", "Lite", "Plus", "Max", "Basic"]),
            category=choice(categories),
            price=price,
            stock=randint(10, 300)
        )
        products.append(product)

    db.add_all(products)
    db.commit()
    return products


def create_orders(db, customers, products, count=2000):
    for _ in range(count):
        customer = choice(customers)
        order_date = date.today() - timedelta(days=randint(0, 90))
        status = choice(statuses)

        selected_products = sample(products, randint(1, 4))
        total_amount = 0

        order = Order(
            customer_id=customer.id,
            order_date=order_date,
            total_amount=0,
            status=status
        )

        db.add(order)
        db.commit()
        db.refresh(order)

        for product in selected_products:
            quantity = randint(1, 3)
            item_total = product.price * quantity
            total_amount += item_total

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                price=product.price
            )

            db.add(order_item)

        order.total_amount = round(total_amount, 2)

        if status == "completed":
            customer.lifetime_value += order.total_amount

        db.commit()


def seed_database():
    reset_database()
    db = SessionLocal()

    try:
        customers = create_customers(db)
        products = create_products(db)
        create_orders(db, customers, products)

        print("Database seeded successfully.")
        print("Created 500 customers, 100 products, and 2,000 orders.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()