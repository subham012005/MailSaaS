import os
import ssl
from unittest.mock import patch

def test_db_config(url):
    print(f"\nTesting URL: {url}")
    with patch.dict(os.environ, {"DATABASE_URL": url}):
        # Mock load_dotenv to avoid side effects
        with patch('dotenv.load_dotenv'):
            # Re-import or re-execute the logic from database.py
            # For testing purpose, I'll copy the logic here to avoid side effects on the actual engine
            
            test_url = os.getenv("DATABASE_URL")
            
            # Logic from database.py
            if (test_url.startswith("postgresql://") or test_url.startswith("postgres://")) and "asyncpg" not in test_url:
                if test_url.startswith("postgres://"):
                    test_url = test_url.replace("postgres://", "postgresql+asyncpg://", 1)
                else:
                    test_url = test_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            
            engine_args = {}
            if "postgresql" in test_url or "postgres" in test_url:
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                engine_args["connect_args"] = {
                    "ssl": ctx, 
                    "statement_cache_size": 0,
                    "prepared_statement_cache_size": 0
                }
            
            print(f"Resulting URL: {test_url}")
            if "connect_args" in engine_args:
                print(f"statement_cache_size: {engine_args['connect_args'].get('statement_cache_size')}")
                print(f"prepared_statement_cache_size: {engine_args['connect_args'].get('prepared_statement_cache_size')}")
            else:
                print("No connect_args set (likely not recognized as Postgres)")

if __name__ == "__main__":
    urls = [
        "postgres://user:pass@host/db",
        "postgresql://user:pass@host/db",
        "postgresql+asyncpg://user:pass@host/db",
        "mysql://user:pass@host/db"
    ]
    for u in urls:
        test_db_config(u)
