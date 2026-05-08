"""
calculations.py

This file calculates the business KPIs for the dashboard.

It reads raw data from the database and turns it into useful metrics such as
total revenue, average order value, repeat purchase rate, customer lifetime
value, category performance, revenue trend, and top products.

Simple explanation:
This file is the brain of the dashboard.
"""

from sqlalchemy import func
from database import SessionLocal
from models import Customer, Product, Order, OrderItem


def get_total_revenue():
    db = SessionLocal()
    try:
        revenue = db.query(func.sum(Order.total_amount))\
            .filter(Order.status == "completed")\
            .scalar()

        return round(revenue or 0, 2)
    finally:
        db.close()


def get_average_order_value():
    db = SessionLocal()
    try:
        total_revenue = db.query(func.sum(Order.total_amount))\
            .filter(Order.status == "completed")\
            .scalar() or 0

        order_count = db.query(Order)\
            .filter(Order.status == "completed")\
            .count()

        if order_count == 0:
            return 0

        return round(total_revenue / order_count, 2)
    finally:
        db.close()


def get_repeat_purchase_rate():
    db = SessionLocal()
    try:
        total_customers = db.query(Customer).count()

        repeat_customers = db.query(Order.customer_id)\
            .filter(Order.status == "completed")\
            .group_by(Order.customer_id)\
            .having(func.count(Order.id) >= 2)\
            .count()

        if total_customers == 0:
            return 0

        return round((repeat_customers / total_customers) * 100, 2)
    finally:
        db.close()


def get_customer_lifetime_value():
    db = SessionLocal()
    try:
        total_revenue = db.query(func.sum(Order.total_amount))\
            .filter(Order.status == "completed")\
            .scalar() or 0

        total_customers = db.query(Customer).count()

        if total_customers == 0:
            return 0

        return round(total_revenue / total_customers, 2)
    finally:
        db.close()


def get_cac_estimate():
    db = SessionLocal()
    try:
        customer_count = db.query(Customer).count()
        assumed_cost_per_customer = 50

        total_cac = customer_count * assumed_cost_per_customer

        return {
            "assumed_cost_per_customer": assumed_cost_per_customer,
            "estimated_total_acquisition_cost": total_cac
        }
    finally:
        db.close()


def get_category_performance():
    db = SessionLocal()
    try:
        results = db.query(
            Product.category,
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue")
        )\
        .join(OrderItem, Product.id == OrderItem.product_id)\
        .join(Order, Order.id == OrderItem.order_id)\
        .filter(Order.status == "completed")\
        .group_by(Product.category)\
        .all()

        return [
            {
                "category": category,
                "revenue": round(revenue, 2)
            }
            for category, revenue in results
        ]
    finally:
        db.close()


def get_revenue_trend():
    db = SessionLocal()
    try:
        results = db.query(
            Order.order_date,
            func.sum(Order.total_amount).label("daily_revenue")
        )\
        .filter(Order.status == "completed")\
        .group_by(Order.order_date)\
        .order_by(Order.order_date)\
        .all()

        return [
            {
                "date": str(order_date),
                "revenue": round(daily_revenue, 2)
            }
            for order_date, daily_revenue in results
        ]
    finally:
        db.close()


def get_top_products(n=5):
    db = SessionLocal()
    try:
        results = db.query(
            Product.name,
            Product.category,
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue")
        )\
        .join(OrderItem, Product.id == OrderItem.product_id)\
        .join(Order, Order.id == OrderItem.order_id)\
        .filter(Order.status == "completed")\
        .group_by(Product.id)\
        .order_by(func.sum(OrderItem.quantity * OrderItem.price).desc())\
        .limit(n)\
        .all()

        return [
            {
                "name": name,
                "category": category,
                "revenue": round(revenue, 2)
            }
            for name, category, revenue in results
        ]
    finally:
        db.close()


def get_all_metrics():
    return {
        "total_revenue": get_total_revenue(),
        "average_order_value": get_average_order_value(),
        "repeat_purchase_rate": get_repeat_purchase_rate(),
        "customer_lifetime_value": get_customer_lifetime_value(),
        "cac_estimate": get_cac_estimate(),
        "category_performance": get_category_performance(),
        "revenue_trend": get_revenue_trend(),
        "top_products": get_top_products()
    }