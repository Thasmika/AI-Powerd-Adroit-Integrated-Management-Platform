import shutil
import os
import datetime

DB_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "../adroit.db"))
BACKUP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backups"))

def backup_database():
    if not os.path.exists(DB_FILE):
        print(f"Database file not found at {DB_FILE}. Nothing to backup.")
        return

    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"adroit_backup_{timestamp}.db")
    
    print(f"Backing up database {DB_FILE} to {backup_file}...")
    shutil.copy2(DB_FILE, backup_file)
    print("Backup completed successfully.")

if __name__ == "__main__":
    backup_database()
