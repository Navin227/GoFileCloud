# 🚀 GoFile – Cloud-Native File Processing Platform

> A scalable, cloud-native file processing platform built on AWS that enables asynchronous file operations such as **compression, conversion, splitting, merging, and AI-powered document summarization**.

![AWS](https://img.shields.io/badge/AWS-Cloud-orange?style=for-the-badge&logo=amazonaws)
![Terraform](https://img.shields.io/badge/Terraform-IaC-623CE4?style=for-the-badge&logo=terraform)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

# 📖 Table of Contents

- Overview
- Features
- System Architecture
- Architecture Workflow
- Technology Stack
- AWS Services Used
- Project Structure
- API Endpoints
- Database Schema
- Storage Structure
- Security
- Scalability
- Monitoring
- Cost Optimization
- Deployment
- Environment Variables
- Local Development
- Challenges
- Future Improvements
- Screenshots
- Author

---

# 📌 Overview

GoFile is a **distributed cloud-native file processing platform** designed to handle computationally intensive document operations asynchronously.

Unlike traditional applications that process files during the API request, GoFile follows an **asynchronous job-based architecture**, allowing users to submit processing requests while dedicated worker containers execute the tasks independently.

The project demonstrates modern cloud engineering concepts including:

- Serverless Computing
- Event-Driven Architecture
- Distributed Processing
- Infrastructure as Code
- Containerization
- Scalable Cloud Storage
- Secure File Handling
- Background Job Execution

---

# ✨ Features

## 📂 File Operations

- Compress Files
- Convert Files
- Merge Multiple PDFs
- Split PDF Documents
- AI-powered Document Summarization
- Background File Processing

---

## ☁ Cloud Features

- Serverless REST APIs
- Asynchronous Processing
- ECS Worker Execution
- Job Status Tracking
- Secure File Uploads
- Secure File Downloads
- Pre-Signed URL Generation
- Cloud Logging
- Infrastructure as Code

---

## 👤 User Features

- Upload Documents
- Select Processing Operation
- Receive Job ID Instantly
- Track Processing Progress
- Download Processed Files
- Fast API Response
- Reliable Processing Pipeline

---

# 🏗 System Architecture

```
                          +----------------------+
                          |      React App       |
                          | (AWS Amplify Hosting)|
                          +----------+-----------+
                                     |
                                     |
                              HTTPS Requests
                                     |
                                     ▼
                        +-------------------------+
                        |     API Gateway         |
                        +------------+------------+
                                     |
                                     ▼
                        +-------------------------+
                        |      AWS Lambda         |
                        |    Request Handler      |
                        +------------+------------+
                                     |
                   +-----------------+------------------+
                   |                                    |
                   ▼                                    ▼
           +------------------+              +-------------------+
           |    DynamoDB      |              | ECS RunTask API   |
           |   Job Metadata   |              +-------------------+
           +--------+---------+                       |
                    |                                 |
                    |                                 ▼
                    |                  +-----------------------------+
                    |                  | ECS Fargate Worker          |
                    |                  | Docker Container            |
                    |                  +-------------+---------------+
                    |                                |
                    |              Download Input File from S3
                    |                                |
                    |                                ▼
                    |                    Process Requested Task
                    |                                |
                    |                                ▼
                    |                    Upload Result to S3
                    |                                |
                    +------------Update Job Status----------------+
                                     |
                                     ▼
                           Processed Files Bucket
                                     |
                                     ▼
                           Generate Pre-Signed URL
                                     |
                                     ▼
                                  End User
```

---

# 🔄 Architecture Workflow

## Step 1

The user uploads a file using the React frontend hosted on AWS Amplify.

---

## Step 2

API Gateway receives the request and invokes an AWS Lambda function.

The Lambda function:

- Validates the request
- Creates a new Job ID
- Stores metadata inside DynamoDB
- Uploads file details
- Returns the Job ID immediately

Job Status:

```
PENDING
```

---

## Step 3

Lambda triggers an ECS Fargate Task.

The task receives:

- Job ID
- Operation Type
- File Location

---

## Step 4

The ECS Worker:

- Downloads the file from Amazon S3
- Processes the file
- Uploads the processed output back to S3

Supported Operations:

- Compression
- Conversion
- Merge
- Split
- AI Summarization

---

## Step 5

Worker updates DynamoDB.

Possible states:

```
PENDING
↓

PROCESSING
↓

COMPLETED

or

FAILED
```

---

## Step 6

Frontend periodically polls the Query API.

When processing is completed:

- Lambda generates a Pre-Signed URL
- User downloads the processed file securely

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- AWS Amplify

---

## Backend

- Python
- AWS Lambda
- REST APIs

---

## Cloud Services

- Amazon API Gateway
- AWS Lambda
- Amazon ECS Fargate
- Amazon S3
- Amazon DynamoDB
- AWS IAM
- Amazon CloudWatch

---

## DevOps

- Terraform
- Docker
- GitHub
- AWS CLI

---

# ☁ AWS Services Used

| Service | Purpose |
|----------|----------|
| API Gateway | REST API Routing |
| Lambda | Request Processing |
| ECS Fargate | Background Worker Execution |
| Amazon S3 | File Storage |
| DynamoDB | Job Metadata Storage |
| IAM | Permissions |
| CloudWatch | Monitoring & Logs |
| Amplify | Frontend Hosting |

---

# 📂 Project Structure

```
GoFile/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── lambda/
│   ├── upload/
│   ├── compress/
│   ├── convert/
│   ├── merge/
│   ├── split/
│   ├── summarize/
│   └── query/
│
├── worker/
│   ├── jobs/
│   ├── utils/
│   ├── Dockerfile
│   └── requirements.txt
│
├── terraform/
│   ├── modules/
│   │   ├── api_gateway/
│   │   ├── lambda/
│   │   ├── ecs/
│   │   ├── dynamodb/
│   │   ├── iam/
│   │   ├── s3/
│   │   ├── cognito/
│   │   └── cloudwatch/
│   │
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── scripts/
│
├── docs/
│
└── README.md
```

---

# 🌐 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /upload-url | Generate Upload URL |
| POST | /compress | Compress File |
| POST | /convert | Convert File |
| POST | /merge | Merge PDFs |
| POST | /split | Split PDF |
| POST | /summarize | AI Summarization |
| GET | /query/{jobId} | Get Job Status |

---

# 🗄 DynamoDB Schema

| Attribute | Description |
|------------|-------------|
| file_id | Partition Key |
| operation | Requested Operation |
| status | Job Status |
| created_at | Timestamp |
| output_key | Processed File Location |
| error | Failure Reason |

---

# 📁 Amazon S3 Structure

```
uploads/
    report.pdf
    image.png
    notes.docx

processed/
    compressed/
    converted/
    merged/
    split/
    summarized/
```

---

# 🔐 Security

GoFile follows cloud security best practices.

- IAM Least Privilege Access
- HTTPS APIs
- Private Amazon S3 Buckets
- Pre-Signed URLs
- Secure Environment Variables
- API Validation
- Role-Based Permissions

---

# 📈 Scalability

GoFile is designed to scale automatically.

- AWS Lambda scales per request
- ECS Fargate launches workers on demand
- Amazon S3 provides virtually unlimited storage
- DynamoDB handles large request volumes
- API Gateway supports thousands of concurrent requests

The asynchronous architecture ensures long-running tasks never block client requests.

---

# 📊 Monitoring

Amazon CloudWatch is used for:

- Lambda Logs
- ECS Logs
- API Logs
- Error Monitoring
- Execution Metrics
- Debugging

---

# 💰 Cost Optimization

To minimize cloud costs, GoFile uses:

- Pay-per-request Lambda execution
- ECS Fargate (no idle servers)
- S3 Lifecycle Policies
- DynamoDB On-Demand Capacity
- Serverless APIs
- Automatic Scaling

---

# 🚀 Deployment

## Deploy Infrastructure

```bash
terraform init
terraform plan
terraform apply
```

---

## Build Worker

```bash
docker build -t gofile-worker .
docker tag gofile-worker <repository>:latest
docker push <repository>
```

---

## Deploy Frontend

```bash
npm install
npm run build
```

Deploy the frontend using AWS Amplify by connecting the GitHub repository.

---

# ⚙ Environment Variables

## Lambda

```env
DYNAMODB_TABLE=
UPLOAD_BUCKET=
PROCESSED_BUCKET=
ECS_CLUSTER=
TASK_DEFINITION=
SUBNETS=
SECURITY_GROUPS=
```

---

## ECS Worker

```env
JOB_TYPE=
JOB_PAYLOAD=
INPUT_BUCKET=
OUTPUT_BUCKET=
AWS_REGION=
```

---

## Frontend

```env
VITE_API_URL=
```

---

# 💻 Local Development

```bash
git clone https://github.com/<username>/GoFile.git

cd GoFile

npm install

cd terraform

terraform init
```

---

# ⚠ Challenges Faced

- Designing an asynchronous processing pipeline
- Triggering ECS tasks from Lambda
- Managing DynamoDB state transitions
- Configuring IAM permissions
- Passing runtime environment variables
- Secure file sharing using Pre-Signed URLs
- Modular Infrastructure using Terraform
- Dockerizing processing workers

---

# 🚀 Future Improvements

- Email Notifications
- WebSocket Live Status Updates
- OCR Integration
- AI Document Classification
- Batch Processing
- Virus Scanning
- User Authentication using Amazon Cognito
- Processing Dashboard
- Multi-region Deployment
- Kubernetes Worker Orchestration

---

# 📸 Screenshots

Add screenshots of:

- Landing Page
- Upload Interface
- Processing Dashboard
- Download Page
- AWS Architecture
- CloudWatch Logs
- ECS Tasks
- Terraform Infrastructure

---

# 👨‍💻 Author

**Navin Sharma**

GitHub: https://github.com/yourusername

LinkedIn: https://linkedin.com/in/yourprofile

---

## ⭐ Star this repository if you found it useful!
