import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv
from database import Base, engine, AsyncSessionLocal
from db_models import User

async def test_connection():
    print("--- Database Connection Test ---")
    
    try:
        # 1. Test Connection & Table Creation
        print("\n1. Testing connection and creating tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Connection successful and tables ensured.")

        # 2. Test Insertion
        print("\n2. Testing data insertion...")
        async with AsyncSessionLocal() as session:
            test_user = User(
                email="test@example.com",
                full_name="Test User",
                avatar_url="https://example.com/avatar.png"
            )
            session.add(test_user)
            await session.commit()
            await session.refresh(test_user)
            user_id = test_user.id
            print(f"✅ Inserted test user with ID: {user_id}")

            # 3. Test Retrieval
            print("\n3. Testing data retrieval...")
            from sqlalchemy import select
            result = await session.execute(select(User).where(User.id == user_id))
            retrieved_user = result.scalar_one_or_none()
            if retrieved_user:
                print(f"✅ Retrieved user: {retrieved_user.full_name} ({retrieved_user.email})")
            else:
                print("❌ Failed to retrieve user.")

            # 4. Test Deletion
            print("\n4. Testing data deletion...")
            await session.delete(test_user)
            await session.commit()
            print("✅ Test user deleted.")

        print("\n--- All tests passed! ---")

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())
