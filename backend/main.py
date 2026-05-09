"""
main.py

This file creates the FastAPI backend server.

It defines the API endpoints that the frontend will call, such as /health and
/metrics.

Simple explanation:
This file lets the frontend ask the backend for KPI data.
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from calculations import get_all_metrics
from insights import generate_insights

app = FastAPI(title="E-Commerce KPI Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Welcome to the E-Commerce KPI Dashboard API. Use /health to check if the API is running and /metrics to get KPI data and insights."
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "E-Commerce KPI Dashboard API is running"
    }


@app.get("/metrics")
def get_metrics(days: int = Query(default=90, ge=7, le=90)):
    metrics = get_all_metrics(days)
    insights = generate_insights(metrics)

    return {
        "metrics": metrics,
        "insights": insights
    }