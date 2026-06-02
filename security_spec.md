# OpenColab Security Specifications

## 1. Data Invariants
- **User Integrity**: A user profile must have their `email` and `name` set, and they cannot alter another user's profile.
- **Organization Isolation**: A member can only read/write tasks, calendar events, and channel messages that belong to their exact `orgId` or `orgCode`. No cross-organization leaks are allowed.
- **Privilege Gating (Tiered Actions)**:
  - Standard users can only modify/delete tasks and events they created (`createdBy == request.auth.uid`).
  - Standard users can only read messages in threads where they are listed as one of the `participants`.
  - Profile modifications are strictly forbidden for anyone other than the profile owner.

## 2. The "Dirty Dozen" Payloads (Vulnerability Scenarios)
1. **Org Code Hijacking / Impersonation**: Attempt to view another profile with a different `orgCode` by direct `get` requests.
2. **Ghost Fields Injection**: Attempt to set `isPremium: true` or `paymentStatus: 'paid'` from client side without paying (should be rejected/blocked during profile updates).
3. **Cross-Tenant Querying**: Attempt to fetch tasks from an organization where the users is not a member.
4. **ID Poisoning Attack**: Attempt to create a document with an ID exceeding 128 characters or containing illegal shell/HTML injection characters.
5. **Timestamp Decoupling**: Sending client-clocked timestamps instead of `request.time` for `createdAt` and `updatedAt`.
6. **Task Forgery / Self-Assignment Override**: Attempting of an assignee to edit non-status fields of a task that they do not own.
7. **Task Hijack**: Attempt to delete tasks created by another team member.
8. **Calendar Ingress**: Creating calendar events in an organization the user does not belong to.
9. **Event Deletion Forgery**: A user attempting to delete a community calendar review they did not create.
10. **Chat Sniffing / Channel Interception**: Attempt to fetch chat log documents from stories where `request.auth.uid` is not present in `participants`.
11. **Chat Tampering**: A user trying to insert a message claiming to be sent by someone else (`senderId != request.auth.uid`).
12. **Null Resource Forgery**: Attempting to delete a document and passing updates requiring validation markers on non-existing elements.

All updates require validation helpers wrapping the matching logic.
