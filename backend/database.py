"""
database.py

This file sets up the database connection for the backend.

It connects the FastAPI app to the SQLite database file called ecommerce.db.
Other backend files use this file to create database sessions so they can read
and write data.

Simple explanation:
This file is the door between Python and the database.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./ecommerce.db"

engine = create_engine(   #Connects Python to the database using SQLAlchemy's create_engine function, specifying the database URL and connection arguments.
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(  #Lets you talk to the database.
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()