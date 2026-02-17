# Impact Protocol Hub

The **Impact Protocol Hub** acts as a central registry and communication gateway for services within the Impact Protocol ecosystem. It enables secure service discovery, routing, and health monitoring while forwarding encrypted requests between services.

## Overview

The hub serves the following purposes:

- Acts as a **service registry**
- Functions as a **gateway for inter-service communication**
- Stores **service metadata and payment configuration**
- Performs **health checks for registered services**
- Forwards **encrypted messages** without accessing payload contents

Services communicate with each other **through the hub**, rather than directly, ensuring standardized routing and coordination.

## Service Registry Data

The hub stores the following information for each registered service:

- Service ID
- Service name
- Route
- Base URL
- Payment address
- Payment type
- Payment amount

> Note: The hub does **not decrypt or inspect messages** — it only forwards encrypted payloads.

## Running the Hub Locally

Follow these steps to run the hub service:

```bash
# Clone the repository
git clone <repo-url>

# Navigate into the project
cd <project-folder>

# Copy environment variables
cp .env.example .env

# Install dependencies
pnpm install

# Start the development server
pnpm start:dev
```

## Purpose

The Impact Protocol Hub provides a **single coordination layer** that simplifies:

- Service registration
- Secure service-to-service communication
- Payment configuration discovery
- System observability through health checks
