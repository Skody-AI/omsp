# Security Policy

## Scope

OMSP is a data specification, not a hosted service — no production data flows through this project. Security concerns for this repository fall into two categories:

1. **Specification integrity** — the trustworthiness of the specification text, schemas, and release artifacts in this repository.
2. **Specification-level security guidance** — semantics in the specification whose misuse or misinterpretation by implementations could cause harm (e.g., tampering with due dates, resource capabilities, or material readiness could produce economically damaging schedules; scheduling data discloses capacity, customer relationships, and order volumes).

## Reporting a vulnerability

For issues affecting specification integrity or security-relevant specification semantics, use **GitHub private vulnerability reporting** on this repository (Security → Report a vulnerability), or email the maintainers at [security contact — to be configured].

Please do not open public issues for suspected vulnerabilities before contacting us privately.

**Response targets:** acknowledgment within 3 business days; assessment within 14 days; public advisory coordinated with the reporter.

## Data sensitivity guidance for implementers

Production scheduling data is competitively sensitive. Implementations exchanging OMSP entities should treat the following as confidential by default: customer identities and order volumes (`Customer`, `SalesOrder`), capacity and utilization patterns (`Machine`, calendars, time off), workforce information (`Employee`, skill matrix), and schedule outputs. The specification's forthcoming security guidance will include data classification recommendations, minimal-disclosure implementation patterns, and anonymization approaches for shared datasets. Datasets published by this project are synthetic or fully anonymized with contributor consent.

## Release integrity

- Releases are tagged and signed.
- Two-person review is required for merges to the specification.
- Maintainer accounts require two-factor authentication.
