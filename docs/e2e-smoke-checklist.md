# E2E smoke checklist (owner)

Use this checklist after deploys (preview and production) to verify the most important customer and admin flows.

## 1) Customer order flow
- [ ] Create a **test order** from the public baguette/order flow.
- [ ] Confirm order creation response includes order number and secure order link/token.
- [ ] Open the tokenized order page (`/order/{number}?token=...`).
- [ ] Validate order status is visible and localized correctly.
- [ ] Verify there are **no online payment controls** on public order pages.
- [ ] Verify `/pay/mock` does not provide demo payment actions and shows that online payment is disabled.
- [ ] Confirm payment/prepayment is handled manually by the manager after order verification.

## 2) Notifications (when env is configured)
- [ ] Verify Telegram notification for new order (if `TELEGRAM_*` envs are configured).
- [ ] Verify customer email (if `SEND_CUSTOMER_EMAILS=true` and SMTP envs are configured).

## 3) Admin auth and health smoke
- [ ] Sign in to admin panel with valid credentials/session.
- [ ] Open admin API-backed pages and confirm no unauthorized errors.
- [ ] Check admin/system health view for DB/fallback warnings.

## 4) Admin content operations
- [ ] Upload one valid image through admin upload endpoint/UI.
- [ ] Review moderation queue and approve/reject one pending review.
- [ ] Read and update one pricing entry (safe test value only).
- [ ] Read and update one page-content entry (safe test value only).

## 5) Failure-path sanity checks
- [ ] Invalid order token returns 403 on `/api/orders/{number}`.
- [ ] `POST /api/payments/create` returns 410 (online payment disabled).
- [ ] `POST /api/payments/mock/complete` returns 410 (online payment disabled).
- [ ] `POST /api/payments/webhook` returns 410 (online payment disabled).
- [ ] Legacy moderation endpoint `/api/reviews/{id}/moderate` returns 410.
- [ ] Legacy lead endpoint `/api/lead` responds with deprecation headers and canonical target `/api/leads`.
