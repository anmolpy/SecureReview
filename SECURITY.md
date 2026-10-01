# Public demo safeguards

Configure `UPSTASH_REDIS_REST_URL` (HTTPS) and `UPSTASH_REDIS_REST_TOKEN` on the server before deploying. All instances must share the same Redis database. Missing or unavailable shared storage fails closed with a 503 response; only explicit development/test mode uses in-memory counters. Never put these credentials in client environment variables.

Analysis quotas use the server-resolved peer IP, independent of User-Agent: 12/minute, 50/day per IP, and 200/day across all instances. Counters are checked and incremented atomically. Daily periods begin with the first request. There are two active analysis slots per server process, released even on failure. Keep Express proxy trust disabled unless you have configured and verified your proxy boundary. The code does not trust arbitrary X-Forwarded-For headers.

Each analysis accepts at most 30,000 characters and requests at most 4,096 output tokens. At most three upstream HTTP attempts are made per analysis, each with a 30-second timeout. Failed analyses consume quota. Provider spend limits remain advisable; request quotas are not exact monetary caps. Concurrency is per process; the shared daily budget spans replicas. Existing status tracking remains process-local and requires sticky routing for reliable polling in multi-instance deployments.

Run `npm ci --legacy-peer-deps --ignore-scripts`, `npm run check`, `npm test`, and `npm run build`. The existing Vite development-plugin peer range requires the compatibility flag. Tests mock the model provider and do not use real API credentials.
