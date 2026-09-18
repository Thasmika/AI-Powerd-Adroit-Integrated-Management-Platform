# Adroit Integrated HR, Vehicle & Equipment Management Database

## Design conclusion

The three proposals support one shared PostgreSQL database for two modules. The schema below follows the required principle: one employee/asset profile, shared document centre, shared expiry engine, shared alerts, shared RBAC, audit, search and AI-assistance logging.

## Table groups

| Group | Tables | Purpose |
|---|---|---|
| Organization | `companies`, `departments`, `locations` | Separates operational, sponsoring and registered companies from departments and branches |
| Security | `app_users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `user_scopes` | Deny-by-default access and organization scope |
| HR | `employees`, `leave_types`, `leave_requests`, `leave_events` | Employee profile and request-review-approval-rejoining history |
| Fleet | `asset_categories`, `assets` | Vehicles, trailers, machines and equipment |
| Documents | `document_types`, `business_documents`, `document_files` | Current document, expiry metadata, private file versions and supersession history |
| Expiry/workflow | `responsible_officer_rules`, `attention_actions`, `notifications` | Configurable ownership, renewal actions and alerts |
| Governance/AI | `audit_events`, `ai_interactions` | Sensitive traceability and permission-aware AI request logging |

## Important relationships

- One employee has many business documents and leave requests.
- One asset has many business documents.
- Each business document belongs to exactly one employee or asset.
- One business document can have many file versions; only one is current.
- Document type controls whether expiry and missing-document checks apply.
- Responsible-officer rules resolve the assignee for renewal actions.
- Dashboards are queries/views over these transactional tables, not duplicated counters.

## Initial reference data

Create document types for Passport, Employment Visa, Emirates ID, Health Insurance, Qualification Certificate, Vehicle Registration, Motor Insurance, Safety Certificate, Inspection/Test Certificate, Permit and Other.

Create leave types for Annual, Emergency and Sick. Create asset categories for Heavy Vehicle, Light Vehicle, Trailer, Heavy Machine/Equipment and Other Company Vehicle.

## Rules to confirm before production

1. Final roles and department/branch visibility.
2. Authentication and MFA/company identity-provider decision.
3. Required employee and asset fields.
4. Leave approver and entitlement rules; payroll remains outside Phase 1.
5. Warning thresholds by document type; support the proposed 60-day horizon.
6. Notification channels and escalation rules.
7. Required versus optional documents.
8. File limits, retention, archival and hard-delete policy.
9. Asset uniqueness and lifecycle rules.
10. AI provider, hosting and privacy requirements.

## Implementation notes

- Keep scanned files in private object storage; store only the storage key and metadata in the database.
- Use immutable UUID primary keys plus unique business identifiers such as Employee No. and Asset/Fleet No.
- Apply authorization before every profile, document, search, dashboard and AI result query.
- Use migrations, daily expiry evaluation, transactional upload handling, and immutable audit rows.
- Add future maintenance, service, fuel, tyres, accidents and payroll tables only after separate approval.
