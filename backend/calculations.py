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
from datetime import date, timedelta

from database import SessionLocal
from models import Customer, Product, Order, OrderItem


def get_start_date(days):
    return date.today() - timedelta(days=days)


def get_total_revenue(days=90):
    db = SessionLocal()
    try:
        start_date = get_start_date(days)

        revenue = db.query(func.sum(Order.total_amount))\
            .filter(Order.status == "completed")\
            .filter(Order.order_date >= start_date)\
            .scalar()

        return round(revenue or 0, 2)
    finally:
        db.close()


def get_average_order_value(days=90):
    db = SessionLocal()
    try:
        start_date = get_start_date(days)

        total_revenue = db.query(func.sum(Order.total_amount))\
            .filter(Order.status == "completed")\
            .filter(Order.order_date >= start_date)\
            .scalar() or 0

        order_count = db.query(Order)\
            .filter(Order.status == "completed")\
            .filter(Order.order_date >= start_date)\
            .count()

        if order_count == 0:
            return 0

        return round(total_revenue / order_count, 2)
    finally:
        db.close()


def get_repeat_purchase_rate(days=90):
    db = SessionLocal()
    try:
        start_date = get_start_date(days)

        customers_with_orders = db.query(Order.customer_id)\
            .filter(Order.status == "completed")\
            .filter(Order.order_date >= start_date)\
            .group_by(Order.customer_id)\
            .all()

        total_customers = len(customers_with_orders)

        repeat_customers = db.query(Order.customer_id)\
            .filter(Order.status == "completed")\
            .filter(Order.order_date >= start_date)\
            .group_by(Order.customer_id)\
            .having(func.count(Order.id) >= 2)\
            .count()

        if total_customers == 0:
            return 0

        return round((repeat_customers / total_customers) * 100, 2)
    finally:
        db.close()


def get_customer_lifetime_value(days=90):
    db = SessionLocal()
    try:
        start_date = get_start_date(days)

        total_revenue = db.query(func.sum(Order.total_amount))\
            .filter(Order.status == "completed")\
            .filter(Order.order_date >= start_date)\
            .scalar() or 0

        customer_count = db.query(Order.customer_id)\
            .filter(Order.status == "completed")\
            .filter(Order.order_date >= start_date)\
            .distinct()\
            .count()

        if customer_count == 0:
            return 0

        return round(total_revenue / customer_count, 2)
    finally:
        db.close()


def get_cac_estimate(days=90):
    db = SessionLocal()
    try:
        start_date = get_start_date(days)

        customer_count = db.query(Customer)\
            .filter(Customer.signup_date >= start_date)\
            .count()

        assumed_cost_per_customer = 50
        total_cac = customer_count * assumed_cost_per_customer

        return {
            "assumed_cost_per_customer": assumed_cost_per_customer,
            "estimated_total_acquisition_cost": total_cac,
            "new_customers_in_period": customer_count
        }
    finally:
        db.close()


def get_category_performance(days=90):
    db = SessionLocal()
    try:
        start_date = get_start_date(days)

        results = db.query(
            Product.category,
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue")
        )\
        .join(OrderItem, Product.id == OrderItem.product_id)\
        .join(Order, Order.id == OrderItem.order_id)\
        .filter(Order.status == "completed")\
        .filter(Order.order_date >= start_date)\
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


def get_revenue_trend(days=90):
    db = SessionLocal()
    try:
        start_date = get_start_date(days)

        results = db.query(
            Order.order_date,
            func.sum(Order.total_amount).label("daily_revenue")
        )\
        .filter(Order.status == "completed")\
        .filter(Order.order_date >= start_date)\
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


def get_top_products(days=90, n=5):
    db = SessionLocal()
    try:
        start_date = get_start_date(days)

        results = db.query(
            Product.name,
            Product.category,
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue")
        )\
        .join(OrderItem, Product.id == OrderItem.product_id)\
        .join(Order, Order.id == OrderItem.order_id)\
        .filter(Order.status == "completed")\
        .filter(Order.order_date >= start_date)\
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


def get_all_metrics(days=90):
    return {
        "selected_period_days": days,
        "total_revenue": get_total_revenue(days),
        "average_order_value": get_average_order_value(days),
        "repeat_purchase_rate": get_repeat_purchase_rate(days),
        "customer_lifetime_value": get_customer_lifetime_value(days),
        "cac_estimate": get_cac_estimate(days),
        "category_performance": get_category_performance(days),
        "revenue_trend": get_revenue_trend(days),
        "top_products": get_top_products(days)
    }