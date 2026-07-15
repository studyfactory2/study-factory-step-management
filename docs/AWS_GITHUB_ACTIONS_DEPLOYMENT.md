# AWS EC2 deployment over SSH

Pushes to `deploy` verify the project, temporarily allow the current GitHub Runner IP to reach EC2 port 22, transfer the source over SSH, and build/update Docker Compose on EC2. The temporary security-group rule is removed when the deployment step exits.

## Architecture

```text
GitHub Actions --SSH--> EC2
                         |-- Caddy :80/:443
                         |-- frontend :3000
                         |-- backend :4000
                         |-- PostgreSQL :5432 (internal only)
                         `-- Redis :6379 (internal only)
```

ECR, S3 deployment storage, SSM, and an EC2 IAM Role are not required.

## EC2 requirements

- Amazon Linux 2023, recommended `t3.medium`
- Encrypted 30 GiB or larger gp3 EBS volume
- An Elastic IP and DNS `A` record
- The EC2 key pair selected when the instance was launched
- Docker and Docker Compose installed by `deploy/ec2/bootstrap-amazon-linux-2023.sh`
- Inbound TCP 80 and 443 open publicly
- No permanent public port 22 rule

The deployment workflow adds a `/32` SSH rule for the current GitHub Runner and removes it at the end. PostgreSQL, Redis, frontend, and backend container ports must not be exposed by the security group.

## Prepare the EC2 environment

Create the production environment file on EC2:

```bash
sudo mkdir -p /opt/study-factory
sudo chown ec2-user:ec2-user /opt/study-factory
cp deploy/.env.production.example /opt/study-factory/.env
chmod 600 /opt/study-factory/.env
vi /opt/study-factory/.env
```

Set the real domain, a URL-safe PostgreSQL password, and a long random JWT secret.

## GitHub production environment

Create a GitHub environment named `production` and add these variables:

| Variable | Example |
| --- | --- |
| `AWS_REGION` | `ap-northeast-2` |
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-actions-study-factory` |
| `EC2_HOST` | Elastic IP or production hostname |
| `EC2_USER` | `ec2-user` |
| `EC2_SECURITY_GROUP_ID` | `sg-0123456789abcdef0` |
| `APP_ORIGIN` | `http://54.117.1.120` initially, later `https://example.com` |

Add one GitHub environment secret:

| Secret | Value |
| --- | --- |
| `EC2_SSH_PRIVATE_KEY` | Entire contents of the `.pem` private key selected at EC2 launch |

The GitHub OIDC role only needs permission to call `ec2:AuthorizeSecurityGroupIngress` and `ec2:RevokeSecurityGroupIngress` for the production security group. Restrict its trust policy to:

```text
repo:studyfactory2/study-factory-step-management:environment:production
```

This IAM role belongs to GitHub Actions, not EC2.

## Persistent data

Docker named volumes retain PostgreSQL data, daily PostgreSQL dumps, Redis AOF data, uploaded files, and Caddy certificates. Enable EBS snapshots and copy database backups off the instance before treating this as production-safe.

## Database initialization

Do not automate `backend/migration/init.sql`; it drops existing tables and types. Run it only after review against the first empty database. Future changes should use incremental TypeORM migrations.

## First deployment

1. Associate an Elastic IP. A domain can be connected later.
2. Confirm the EC2 key pair private key is available.
3. Create `/opt/study-factory/.env` on EC2.
4. Configure the GitHub OIDC role, variables, and `EC2_SSH_PRIVATE_KEY` secret.
5. Push `deploy` or manually run the workflow.
6. Check the Actions output and `APP_ORIGIN/api/health`.

Without a domain, set `APP_ORIGIN=http://ELASTIC_IP` and `SITE_ADDRESS=:80` in the EC2 `.env`. This is suitable only for initial testing because credentials and application traffic are not encrypted. After connecting a domain, change them to `APP_ORIGIN=https://your-domain` and `SITE_ADDRESS=your-domain` and redeploy.
