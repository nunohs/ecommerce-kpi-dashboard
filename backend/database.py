from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
"""
his file sets up the database connection.

It tells the backend where the SQLite database is located and creates the database session that other files use to read and write data.

In simple terms, this file is the “door” between Python and the database.

Main responsibilities:
- Connect to `ecommerce.db`
- Create the SQLAlchemy engine
- Create database sessions
- Provide `Base`, which is used by the models to create tables
"""
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