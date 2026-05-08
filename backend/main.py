"""
main.py

This file creates the FastAPI backend server.

It defines the API endpoints that the frontend will call, such as /health and
/metrics.

Simple explanation:
This file lets the frontend ask the backend for KPI data.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from calculations import get_all_metrics

app = FastAPI(title="E-Commerce KPI Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "E-Commerce KPI Dashboard API is running"
    }


@app.get("/metrics")
def get_metrics():
    metrics = get_all_metrics()

    return {
        "metrics": metrics
    }