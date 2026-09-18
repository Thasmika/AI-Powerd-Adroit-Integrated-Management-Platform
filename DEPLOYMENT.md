# Deployment Runbook (AWS EC2)

This document provides step-by-step instructions for deploying the Adroit Integrated Management Platform to an AWS EC2 instance.

## 1. Prerequisites (AWS Console)
1. **Launch EC2 Instance**: Amazon Linux 2023 or Ubuntu 22.04 LTS (t3.medium or larger recommended).
2. **Security Group**: Open the following inbound ports:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
3. **Elastic IP**: Allocate and associate an Elastic IP to the instance.
4. **Domain Record**: Point your domain's A-record to the Elastic IP (e.g., `app.adroit.ae`).
5. **IAM User**: Create an IAM User for GitHub Actions with permissions to access EC2 via Systems Manager (SSM) or use standard SSH key authentication.
6. **S3 Bucket**: Create an S3 bucket for database backups (e.g., `adroit-db-backups`).

## 2. Server Provisioning (Initial Setup)

SSH into your EC2 instance and install Docker & Docker Compose:

```bash
# For Amazon Linux 2023
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Install Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins/
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Create application directory
sudo mkdir -p /opt/adroit
sudo chown -R ec2-user:ec2-user /opt/adroit
```

Log out and back in to apply the docker group permissions.

## 3. GitHub Secrets Configuration

Add the following secrets to your GitHub repository (`Settings` > `Secrets and variables` > `Actions`):

- `PROD_HOST`: Your EC2 Elastic IP or domain name.
- `STAGING_HOST`: Your staging EC2 IP (if applicable).
- `EC2_USERNAME`: `ec2-user` (for Amazon Linux) or `ubuntu` (for Ubuntu).
- `EC2_SSH_KEY`: The private `.pem` key used to SSH into the instance.

## 4. Environment Configuration

On the EC2 instance, create the `.env` file:

```bash
cd /opt/adroit
nano .env
```
Copy the contents of `.env.example`, fill in the actual secure values (e.g., strong DB password, strong SECRET_KEY), and save.

## 5. First Deployment

The first deployment is triggered via GitHub Actions:
1. Commit and push your code to the `main` branch.
2. Go to the Actions tab in GitHub. The pipeline will build and push the images to GHCR, then wait for your manual approval to deploy to Production.
3. Once approved, the action SSHes into the server, pulls the images, and runs `docker compose up -d`.

Alternatively, manually trigger the pull on the server:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 6. SSL Configuration (Certbot / Let's Encrypt)

If you are not using an AWS ALB for SSL termination, you can configure Certbot on the EC2 instance:

```bash
sudo yum install certbot python3-certbot-nginx
sudo certbot --nginx -d app.adroit.ae
```
Certbot will automatically update your NGINX configuration to handle SSL and set up auto-renewal.

## 7. Zero-Downtime Updates

GitHub Actions handles updates automatically. It pulls the latest images and restarts the containers. Since `docker-compose up -d` recreates only the containers whose configuration or image has changed, downtime is minimized (typically just a few seconds while the new backend/frontend container starts).

## 8. Backup & Restore

**Automated Backups:**
The GitHub Action `.github/workflows/db-backup.yml` runs daily at 02:00 UTC. It executes `backup_db_postgres.py` inside the backend container, which dumps the database and uploads it to S3.

**Manual Restore:**
1. Download the `.sql.gz` backup file from S3.
2. Copy it to the EC2 server.
3. Unzip the file: `gunzip backup_file.sql.gz`.
4. Restore into the Postgres container:
   ```bash
   cat backup_file.sql | docker exec -i $(docker compose ps -q db) psql -U postgres -d adroit_db
   ```
