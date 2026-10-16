# V0.86 cleanup incident persistence checkpoint (staging only)

Created an incident store adapter that requires an injected authenticated durable gateway with create-if-absent, get, and compare-and-set status update. Deterministic incident keys make repeated incident recording idempotent. State transitions reject changes after resolved; blocked records cannot silently become retryable. Only allowlisted metadata is persisted; tokens, image contents and raw errors are excluded.

Local tests: 12 adapter checks passed. **This is not connected to a real Firestore collection or a scheduled retry worker.** No production files or rules changed. Remaining work: define secured gateway and Firestore rules, implement retries, audit and integration tests before deployment.
