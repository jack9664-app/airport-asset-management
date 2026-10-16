# V0.86 photo integration — development checkpoint

Not deployed. Keep V0.85 production unchanged.

Confirmed from V0.85 source:
- Handover: `handovers/{handoverId}`.
- Progress: `handovers/{handoverId}/progress/{progressId}`.
- Deleted handover: `status === '已刪除'` or `deleted === true`.
- Deleted progress: `deleted === true`.
- Existing forms have photo placeholders; save transactions do not yet persist photo references.
- Existing audit collection: `handoverAudit`.
- Progress paging: 20 records at a time.

Next gates: owner Firestore REST read live verification; Editor/Viewer server-side role checks; Firestore photo-reference transaction and rules; photo deletion audit; concurrency cap; real integration tests. Drive deletion remains trash-only; no automatic reattachment after recovery.
