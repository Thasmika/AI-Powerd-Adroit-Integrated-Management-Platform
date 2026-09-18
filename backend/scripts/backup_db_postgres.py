import os
import subprocess
import datetime
import boto3
from botocore.exceptions import NoCredentialsError, ClientError

def backup_postgres_to_s3():
    # DB credentials (fallback to defaults if not provided in environment)
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_name = os.getenv("POSTGRES_DB", "adroit_db")
    
    # AWS S3 Configuration
    s3_bucket = os.getenv("AWS_S3_BACKUP_BUCKET")
    aws_region = os.getenv("AWS_REGION", "us-east-1")
    
    # Create backup filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"backup_{db_name}_{timestamp}.sql.gz"
    backup_path = f"/tmp/{backup_file}"
    
    print(f"Starting backup of database {db_name}...")
    
    # Run pg_dump and pipe to gzip
    # Note: PGPASSWORD must be set in the environment before calling this script
    dump_cmd = f"pg_dump -U {db_user} -h db -d {db_name} | gzip > {backup_path}"
    
    try:
        subprocess.run(dump_cmd, shell=True, check=True)
        print(f"Database dumped successfully to {backup_path}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to dump database: {e}")
        return
        
    if not s3_bucket:
        print("AWS_S3_BACKUP_BUCKET not set. Skipping S3 upload.")
        return
        
    print(f"Uploading {backup_file} to S3 bucket {s3_bucket}...")
    
    s3_client = boto3.client('s3', region_name=aws_region)
    try:
        s3_client.upload_file(backup_path, s3_bucket, backup_file)
        print(f"Backup uploaded successfully to s3://{s3_bucket}/{backup_file}")
    except FileNotFoundError:
        print(f"The file {backup_path} was not found.")
    except NoCredentialsError:
        print("AWS credentials not available.")
    except ClientError as e:
        print(f"Failed to upload to S3: {e}")
    finally:
        # Clean up local backup file
        if os.path.exists(backup_path):
            os.remove(backup_path)
            print(f"Removed local backup file {backup_path}")

if __name__ == "__main__":
    backup_postgres_to_s3()
