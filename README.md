# Enterprise Asset Management System (EAM)

This project is a **web-based Enterprise Asset Management (EAM) system** designed to help organizations manage their fixed assets efficiently. The system provides functionalities for asset lifecycle management, user access control, and workflow approvals.

## Features

* **User & Role Management** – Admins can manage users, roles, and permissions.
* **Asset Lifecycle Management** – Supports asset creation, assignment, transfer, borrowing, retirement, and maintenance.
* **Asset Categories & Attributes** – Customizable classification tree and metadata for different asset types.
* **Approval Workflows** – Handles requests for asset usage, transfers, and returns.
* **Audit & Logs** – Maintains detailed operation logs for traceability.
* **Integration** – Supports Feishu (Lark) account binding, notifications, and approval processes.
* **Analytics** – Asset statistics, depreciation calculation, and alerts for outdated or low stock assets.

## Tech Highlights

* **Frontend**: Web portal with role-based UI.
* **Backend**: RESTful APIs for asset management operations.
* **Database**: Relational schema with entities for users, assets, departments, and requests.
* **Security**: Encrypted authentication, secure communication channels.
* **Scalability**: Designed to support up to 100k assets and 50k users simultaneously.

## Usage

* **System Admins** configure business entities, users, and roles.
* **Asset Admins** manage asset records, approvals, and maintenance.
* **Employees** can request, borrow, and return assets via the portal.

## Documentation

The project deliverables include:

* Requirement Analysis (user stories, use case diagrams, workflows)
* System Design (modules, APIs, sequence/state diagrams)
* Database Design (E-R diagrams, schema details)