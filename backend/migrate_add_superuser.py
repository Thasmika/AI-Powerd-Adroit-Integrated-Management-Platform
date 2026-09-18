"""
One-time migration: adds is_superuser column to users table
and marks the admin@adroit.com account as a superuser.
"""
import sqlite3

DB_PATH = "adroit.db"
ADMIN_EMAIL = "admin@adroit.com"

conn = sqlite3.connect(DB_PATH)

# Check if column already exists
cols = [row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()]
if "is_superuser" not in cols:
    conn.execute("ALTER TABLE users ADD COLUMN is_superuser BOOLEAN DEFAULT 0 NOT NULL")
    print("Column is_superuser added to users table.")
else:
    print("Column is_superuser already exists.")

# Promote the admin account
result = conn.execute(
    "UPDATE users SET is_superuser = 1 WHERE email = ?", (ADMIN_EMAIL,)
)
conn.commit()

if result.rowcount > 0:
    print(f"Admin account '{ADMIN_EMAIL}' promoted to superuser.")
else:
    print(f"No user found with email '{ADMIN_EMAIL}'. Run add_admin.py first.")

# Verify
row = conn.execute(
    "SELECT id, email, is_active, is_superuser FROM users WHERE email = ?",
    (ADMIN_EMAIL,),
).fetchone()
if row:
    print(f"Admin state: id={row[0]}, email={row[1]}, is_active={row[2]}, is_superuser={row[3]}")

conn.close()
print("Migration complete.")
