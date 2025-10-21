# Sample JSON API

- Method: `GET`
- URL: `/api/sample`
- Auth: None (public)
- Purpose: Return a small, stable JSON payload for testing and integration checks.

## Response
- Status: `200 OK`
- Content-Type: `application/json`

### Shape
```
{
  "data": {
    "id": number,
    "title": string,
    "status": string,
    "tags": string[],
    "count": number
  },
  "meta": {
    "request_id": string,        // UUID v4
    "generated_at": string,      // ISO 8601 timestamp
    "version": string
  }
}
```

### Example
```
{
  "data": {
    "id": 1,
    "title": "Sample Item",
    "status": "ok",
    "tags": ["demo", "api", "test"],
    "count": 3
  },
  "meta": {
    "request_id": "8c2a69d8-0b2a-4e23-9f11-57c38b3a1db4",
    "generated_at": "2025-10-21T12:34:56.000000Z",
    "version": "1.0"
  }
}
```

## Notes
- Intended for quick smoke tests and frontend wiring.
- Stable field names and types; values may vary per request (`request_id`, `generated_at`).
- Accessible via browser at `http://127.0.0.1:8004/api/sample` when the dev server is running.