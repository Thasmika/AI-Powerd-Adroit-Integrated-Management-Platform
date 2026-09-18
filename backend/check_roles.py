import sqlite3
conn = sqlite3.connect('adroit.db')
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Tables:', [t[0] for t in cur.fetchall()])

cur.execute('SELECT id, email, is_superuser FROM users')
users = cur.fetchall()
print('\n=== USERS ===')
for u in users:
    print(f'  id={u[0]} email={u[1]} superuser={u[2]}')

cur.execute('SELECT id, name FROM roles')
roles = cur.fetchall()
print('\n=== ROLES ===')
for r in roles:
    print(f'  id={r[0]} name={r[1]}')

# Try common join table names
for table in ['user_roles', 'users_roles', 'role_user']:
    try:
        cur.execute(f'SELECT * FROM {table}')
        rows = cur.fetchall()
        print(f'\n=== {table.upper()} ===')
        for row in rows:
            print(f'  {row}')
        break
    except Exception as e:
        print(f'{table}: {e}')

conn.close()
