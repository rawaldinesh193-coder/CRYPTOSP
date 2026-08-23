# CRYPTOSP Legal & Compliance Architecture Framework

## 1. Regulatory Status of Phoenix Coin (PHX)
Phoenix Coin is an internal platform accounting unit with an administrator-configured reference value ($10.00 USD).
- **Not a Publicly Traded Cryptocurrency**: PHX is strictly an internal settlement asset.
- **Not a Bank Deposit**: PHX holdings do not represent insured bank deposits or fiat currency reserves unless backed by licensed custodial banking integrations.

## 2. Configurable KYC & Risk Screening Extension Points
The database model includes `verificationStatus` (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`) and `accountStatus` (`ACTIVE`, `RESTRICTED`, `SUSPENDED`, `CLOSED`).

Before launching live fiat on/off ramps:
1. Integrate third-party KYC provider (e.g. Sumsub / Persona) via webhook endpoint.
2. Enforce transaction limits based on verification tier.
3. Conduct jurisdiction-specific legal review for money transmission licenses.
