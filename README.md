# Impact Protocol Hub

The Impact Protocol Hub is a service registry and communication gateway for Impact Protocol services. It validates target capabilities, routes payloads, and executes requests either synchronously or through Redis-backed queues.

## Overview

The hub is responsible for:

- Service and capability lookup via database records
- Gateway-style request forwarding between services
- Optional asynchronous processing with BullMQ
- Forwarding response callbacks through a dedicated response queue
- Health and status-aware routing (only ONLINE services are routed)

## Request API

### POST /request

Controller: `RequestController.createRequest()`

This endpoint receives a request payload and delegates processing to `RequestService.createRequest()`.

Expected body (`CreateRequestDto`):

- `version`: string
- `serviceId`: string
- `capability`: string
- `senderId`: string
- `message`: string (encrypted payload)
- `callbackUrl?`: string
- `payment?`: string

Runtime behavior:

1. Hub looks up capability by `(serviceId, capability)`.
2. Hub validates that the target service is `ONLINE`.
3. Hub builds target endpoint as `service.baseUrl/capability.path` and uses capability HTTP method.
4. Execution mode decides flow:
	 - `SYNC`: hub immediately calls target endpoint and returns target response.
	 - Async mode: hub enqueues a job on `request` queue and returns `{ success, message, jobId }`.

## Response API

### POST /response

Controller: `ResponseController.recieveResponse()`

This endpoint accepts downstream responses and delegates to `ResponseService.followResponse()`.

Expected body (current runtime fields):

- `status`
- `responsePayload`
- `responseSender`
- `responseReceiver`

Runtime behavior:

1. Hub resolves receiver service by `responseReceiver`.
2. Hub builds callback URL as `<receiverService.baseUrl>/response`.
3. Hub enqueues a `response` job with `method: 'POST'`, URL, and response payload fields.
4. Hub returns queued acknowledgment with `jobId`.

## Queue Implementation Flow (BullMQ)

The hub defines two queues:

- `request` queue (job name: `request`)
- `response` queue (job name: `response`)

Processors:

- `RequestProcessor` consumes `request` jobs.
- `ResponseProcessor` consumes `response` jobs.

Both processors:

- Use `WorkerHost` from `@nestjs/bullmq`
- Dispatch by `job.name`
- Perform outbound HTTP request using shared `httpClient`
- Emit worker lifecycle logs on `active`, `completed`, and `failed`

End-to-end request flow:

1. Client sends `POST /request`.
2. Hub validates capability and execution mode.
3. If sync, hub calls target immediately and returns response.
4. If async, hub enqueues `request` job and returns `jobId`.
5. `RequestProcessor` picks job and performs outbound call.
6. Target service can later submit `POST /response`.
7. Hub enqueues `response` job.
8. `ResponseProcessor` forwards response data to `<receiverBaseUrl>/response`.

## Infrastructure Notes

- Queue backend: Redis (configured via `BullModule.forRoot`)
- Redis config env vars:
	- `REDIS_HOST` (default: `localhost`)
	- `REDIS_PORT` (default: `6380`)
	- `REDIS_PASSWORD` (default: empty)

## Running the Hub Locally

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
