# Integrated HR & Vehicle Management Platform - Full Implementation Plan

This execution plan synthesizes the requirements from both the **Integrated HR Phase 1 Developer Specification** and the **AI-Assisted Vehicle & Equipment Management System** proposals. The architecture ensures a unified digital core with separate functional modules.

## User Review Required

> [!IMPORTANT]
> **Premium Frontend Aesthetics:** The user has mandated a "WOW-factor", highly designable frontend. We will construct a robust, premium UI architecture using advanced Vanilla CSS (variables, glassmorphism, fluid animations, sophisticated layout design). It will *not* look like a standard MVP.
> **Unified Backend Architecture:** The system uses FastAPI and SQLAlchemy. We will enforce strict referential integrity, automated transaction rollbacks, and scalable service-layer design.

## Open Questions

> [!WARNING]
> 1. **Authentication Strategy:** Should we use local JWT-based email/password authentication, or integrate with an SSO provider?
> 2. **Document Storage:** For the Document Centre files, should we configure local disk storage or use cloud storage (like AWS S3 / Google Cloud Storage) from the beginning?

---

## Proposed Changes

### 1. Database Schema & Master Entities (Strict Referential Integrity)

#### Shared Technical Foundation Models
- **`backend/app/models/company.py`**: Refine Company, Department (e.g., Admin, Trading, Transport), and Branch/Location hierarchies (e.g., Aweer, Satwa).
- **`backend/app/models/document.py`**: Define `DocumentType`, `DocumentFile` (Private object storage, no public direct access URLs), and association tables.
- **`backend/app/models/auth.py`**: **RBAC Engine** with department/branch scope. Roles mapped: System Administrator, Management, HR Officer, PRO/Compliance Officer, Insurance Officer, Department Head, Fleet/Transport Officer, Read-Only Auditor.
- **`backend/app/models/audit.py`**: Define `AuditEvent` (immutable traceability for sensitive reads/writes/approvals) and `NotificationTemplate`.

#### SYSTEM 1: HR Management Models
- **`backend/app/models/employee.py`**: Implement `Employee` profile (Identity, Designation, Visa Sponsoring Company vs Operating Company, Insurance provider details).
- **`backend/app/models/leave.py`**: Implement `LeaveRequest` (Types: Annual, Emergency, Sick. Stages: Request, HR Review, Approval, Vacation, Rejoining tracking).

#### SYSTEM 2: Vehicle Management Models
- **`backend/app/models/asset.py`**: Implement `Asset` (Fleet No, Registration No, Category [Heavy/Light/Trailer/Machine], Make/Model, Year, Chassis/VIN, operational status, owning company).

---

### 2. Core Architecture & Backend Services

#### [NEW] backend/app/core/background_jobs.py
- **Reliable Scheduler/Queue**: Dedicated background worker architecture (e.g., Celery or APScheduler) with retry and failure logging to handle automated daily expiry calculations and digest generation.

#### [NEW] backend/app/services/expiry_engine.py
- **Central Expiry & Alert Service**: Processes HR documents (Visas, Passports, Emirates ID, Health Insurance) and Fleet documents (Registration, Motor Insurance, Safety Certs, Inspection/Permits). Calculates EXPIRED, URGENT (≤30 days), and RENEWAL DUE (31-60 days) statuses. Uses configurable thresholds, not hard-coded logic.

#### [NEW] backend/app/services/ai_assistance.py
- **AI Query Engine**: Natural-language query translation. Maps user requests to read-only structured database queries. **Strict technical control**: AI answers must use the exact same effective RBAC permissions as the signed-in user and have no unrestricted DB access.

#### [NEW] backend/app/services/notification_service.py
- **Notification Engine**: Handles template-based in-app alerts and optional email rollouts, resolving the designated responsible officer (e.g., HR vs PRO vs Fleet Officer) based on the document type.

#### [MODIFY] backend/app/services/document_service.py
- **Shared Document Management**: Secure file association, versioning, metadata tracking. **Security rule**: Application must authorize requests before serving file downloads (no public URLs).

---

### 3. REST API Endpoints

#### SYSTEM 1: Employee Endpoints (`/api/v1/employees/`)
- Profile CRUD operations.
- Document upload, preview, and renewal logic.
- Leave workflow requests and approvals.

#### SYSTEM 2: Vehicle Endpoints (`/api/v1/assets/`)
- Fleet register CRUD operations.
- Vehicle compliance document upload and action tracking.

#### Shared Endpoints (`/api/v1/`)
- `/dashboard/`: Unified metrics (Total Employees, On Leave, Total Assets, Missing Docs, Expiring ≤60 Days).
- `/ai/`: Natural language interaction endpoint for the AI Assistant.
- `/audit/`: Immutable operational traceability logs.

---

### 4. Frontend UI Foundation (Adroit PDF Alignment)

The frontend will be rebuilt to strictly adhere to the exact visual designs, color schemes, layouts, and typography provided in the *Adroit Phase 1 Proposal PDF*.

#### [MODIFY] frontend/src/app/(dashboard)/hr/page.tsx
- **Main HR Dashboard (Page 5 Alignment)**
- Implement the exact top statistics bar: `Employees (Active records)`, `Expiring <= 60 Days`, `On Leave (Currently away)`, and `Pending Actions (HR follow-up)` with their distinct colored background panels.
- Layout a two-column section below: "UPCOMING EXPIRIES" (bulleted list of expiring documents) and "QUICK ACTIONS" (+ Add New Employee, etc.).
- Add the AI request bar at the bottom: `Example AI request: "Show employees whose visas or Emirates IDs expire within the next 60 days."` with a soft blue background.

#### [MODIFY] frontend/src/app/(dashboard)/employees/[id]/page.tsx
- **Employee Master (Legacy Integration & Premium Dashboard UI)**
- We will integrate the *structure* of the Prototype PDF (Left, Middle, Right header blocks + Tabs) with the *premium dark mode aesthetic* established for the dashboard, populated with the *real fields* from the legacy VB6 system screenshot.

**Field Mapping from Legacy System:**
- **Left Block (Identity):** 
  - Photo, Active Status (Badge), Employee No, Employee Code (e.g., SAK).
- **Middle Block (Employee Information):**
  - Employee Name, Department, Designation, Salary Category, Salary Transfer Status.
- **Right Block (Employment & Sponsorship):**
  - Sponsor (e.g., Adroit Enterprises L.L.C Satwa Branch), Visa Issued By, Company MOL ID, Emp MOL ID, Health Card No, Insurer (e.g., OMAN).
- **Tabs Container (Below Header):**
  - Employment, Salary, Personal, Passport, Visa, License, LabourCard, Certificate, Documents, Leave.
  - *Note: Bank details (A/C, Routing No, Bank Name) and EID/UID will be placed inside their respective tabs (Salary and Personal/Documents).*

#### [MODIFY] frontend/src/app/(dashboard)/documents/page.tsx
- **Document & Expiry Centre (Page 7 Alignment)**
- Rebuild the table to exactly match the columns: `Document`, `Document No.`, `Expiry Date`, `Status`, `Digital Copy`.
- Apply exact status text styling: Green `VALID`, Red `RENEWAL DUE`, Green `ON FILE`.
- Add the three information boxes below the table: `Advance Warning` (blue), `Assigned Responsibility` (orange), and `Easy Retrieval` (green).

#### [MODIFY] frontend/src/app/(dashboard)/leaves/page.tsx
- **Professional Leave Management (Page 8 Alignment)**
- Build the exact 6-step progress tracker: `1 Leave Request`, `2 HR Review`, `3 Approval`, `4 Vacation`, `5 Rejoining`, `6 History` with text descriptions below each step.
- Add the three information blocks: `Leave Types` (white), `Management Visibility` (light blue), and `Paper Reduction` (light blue).

#### Shared UI Assets & CSS
- We will rely strictly on vanilla CSS modules to ensure high-fidelity matching of the exact colors, typography, borders, and spacings presented in the PDF prototypes. Tailwind will only be used if already deeply integrated, otherwise Vanilla CSS will provide the exact bespoke matching required.

---

## Verification Plan

### Automated Tests
- Unit testing for the `expiry_engine.py` using boundary dates to guarantee accuracy.
- API endpoint integration tests to verify RBAC security layers.

### Manual Verification
- Deploy the frontend/backend locally.
- Create 1 Employee and 1 Vehicle. Upload test compliance documents.
- Run the AI Assistant to ensure it correctly identifies missing or expiring documents for both the employee and the vehicle.
- Conduct a visual design audit to confirm the frontend meets premium aesthetic standards.

---

## Phase 5 Execution Plan (Testing, QA & Migration)

This section outlines the approach to complete Phase 5 requirements.

### 1. Testing Framework & Implementation
#### [NEW] backend/tests/
- Install `pytest`, `pytest-asyncio`, and `httpx` for comprehensive testing.
- Set up a test database environment to isolate testing from development data.
- **Tests to implement**:
  - `test_expiry_engine.py`: Unit tests covering boundary edge cases (expired, exactly 30 days, 31-60 days) for both HR and Vehicle documents.
  - `test_documents.py`: Unit tests for secure document upload restrictions and metadata integrity.
  - `test_core_apis.py`: Integration tests for main CRUD operations and RBAC rules (verifying unauthorized access is blocked).

### 2. Data Migration & Scripts
#### [NEW] backend/scripts/
- **`backup_db.py`**: A utility script to perform automated pre-import backups of the database (handling SQLite or PostgreSQL).
- **`import_data.py`**: A robust data migration script leveraging pandas or standard CSV parsing to import legacy employee and asset records into the new system.
  - Features include: deduplication, schema mapping, and validation using Pydantic before DB insertion.
- **`reconcile_import.py`**: A post-import reconciliation script that cross-references source row counts with destination DB counts and flags discrepancies.

### 3. User Acceptance Testing (UAT)
- Provisioning a dedicated UAT environment.
- Delivering a structured UAT checklist for management to execute realistic usage scenarios (e.g., onboarding an employee, uploading a vehicle registration, triggering a simulated expiration).
