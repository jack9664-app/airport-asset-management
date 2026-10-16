# V0.86 photo reference test checkpoint

Local automated checks: 11/11 passing on 2026-10-16.

Validated: metadata format, invalid IDs and dates, first photo, duplicate rejection, five-photo maximum, sixth-photo rejection, soft deletion metadata, freed capacity after deletion, and duplicate deletion rejection.

Important: these are pure logic tests, NOT Firestore Security Rules integration tests or Google Drive authorization tests. V0.86 remains staging-only; V0.85 production unchanged.

Remaining security gate: verify server-side role authorization and Firestore rules before exposing transaction helpers to UI. Also resolve orphan-file compensation if Firestore commit fails after Drive upload, and maintain audit on deletion.
