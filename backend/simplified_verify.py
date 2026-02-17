import ssl

def check_logic(DATABASE_URL):
    print(f"Original: {DATABASE_URL}")
    
    # Logic from database.py
    if (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")) and "asyncpg" not in DATABASE_URL:
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
        else:
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    print(f"Transformed: {DATABASE_URL}")
    
    engine_args = {}
    if "postgresql" in DATABASE_URL or "postgres" in DATABASE_URL:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        engine_args["connect_args"] = {
            "ssl": ctx, 
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0
        }
        print("Set connect_args: True")
        print(f"statement_cache_size: {engine_args['connect_args']['statement_cache_size']}")
    else:
        print("Set connect_args: False")

print("--- Test 1 ---")
check_logic("postgres://user:pass@host/db")
print("\n--- Test 2 ---")
check_logic("postgresql://user:pass@host/db")
print("\n--- Test 3 ---")
check_logic("postgresql+asyncpg://user:pass@host/db")
print("\n--- Test 4 ---")
check_logic("mysql://user:pass@host/db")
