# V0.86 Firestore rules schema alignment — staging review

Date: 2026-10-16. **NOT DEPLOYED**.

The previous rules draft expected `photos` to be an array of string IDs. The V0.86 frontend instead creates photo metadata objects containing `fileId`, `fileName`, `createdBy`, `createdAt`, and `deleted`, with deletion audit fields. This incompatibility would reject legitimate writes.

A conservative corrected local draft exists as `mgmt_v086_rules_schema_locked_draft.txt`. It validates photo metadata object shapes and **keeps photo arrays immutable during ordinary handover/progress updates**. This intentionally does not enable photo uploads; doing so now would be unsafe without enforcing active-photo limits, unique IDs, provenance, audit consistency and server-side authorization in rules.

Local tests passed: 6 schema contract checks, 11 photo-reference logic tests, and 15 role-policy tests. No Firestore Rules emulator/integration tests performed. Next step is designing and testing dedicated photo mutation rules and audit validation, then connecting the actual app to the backend.

Drive trash-only deletion and no automatic reattachment after restore remain product requirements. Production V0.85 and deployed Firestore rules remain unchanged.
