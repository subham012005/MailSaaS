import pymysql

# Read SQL file
with open('add_byok_columns.sql', 'r') as f:
    sql = f.read()

# Connect to database (from DATABASE_URL: mysql+aiomysql://root:1234@localhost:3306/decision_intelligence)
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='1234',
    database='decision_intelligence'
)

try:
    with connection.cursor() as cursor:
        # Execute each statement
        for statement in sql.split(';'):
            if statement.strip():
                cursor.execute(statement)
    connection.commit()
    print("✅ Migration successful! Columns added.")
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    connection.close()
