# Data Dictionary

Source: Interpreted from the provided ERD (image 1).  
Note: The diagram does not explicitly show nullability or indexes beyond primary/foreign keys. Where appropriate, recommendations are noted.

## Entities

- departments: Organizational units.
- positions: Job roles within departments.
- employees: People employed by the organization and assigned to positions.
- courses: Training courses.
- positioncourses: Link table defining which courses are required/associated for each position.
- employeetraining: Link table tracking which courses an employee has taken and when they completed them.

---

## Table: departments

- Purpose: Master list of departments.

| Column | Data Type | PK | FK | Nullable | Description | References |
|-------|-----------|----|----|----------|-------------|------------|
| id | INT | Yes |  | No | Unique identifier for the department. |  |
| name | VARCHAR(255) |  |  | No (recommended) | Department name. |  |

Keys and Indexes:
- Primary Key: (id)

---

## Table: positions

- Purpose: Job positions/roles within departments.

| Column | Data Type | PK | FK | Nullable | Description | References |
|-------|-----------|----|----|----------|-------------|------------|
| id | INT | Yes |  | No | Unique identifier for the position. |  |
| title | VARCHAR(255) |  |  | No (recommended) | Position title (e.g., “Software Engineer”). |  |
| departmentId | INT |  | Yes | No (recommended) | Department this position belongs to. | departments(id) |

Relationships:
- Many positions belong to one department.

Keys and Indexes:
- Primary Key: (id)
- Foreign Key: (departmentId) → departments(id)

---

## Table: employees

- Purpose: Employee master records.

| Column | Data Type | PK | FK | Nullable | Description | References |
|-------|-----------|----|----|----------|-------------|------------|
| id | BIGINT | Yes |  | No | Unique identifier for the employee. |  |
| firstName | VARCHAR(255) |  |  | No (recommended) | Employee first name. |  |
| lastName | VARCHAR(255) |  |  | No (recommended) | Employee last name. |  |
| email | VARCHAR(255) |  |  | No (recommended) | Employee email address. Consider unique. |  |
| hireDate | DATE |  |  | No (recommended) | Date the employee was hired. |  |
| positionId | INT |  | Yes | No (recommended) | Position currently held by the employee. | positions(id) |
| address1 | VARCHAR(255) |  |  | Yes | Street address line 1. |  |
| city | VARCHAR(255) |  |  | Yes | City. |  |
| state | VARCHAR(255) |  |  | Yes | State/Province/Region. |  |
| postal | VARCHAR(20) |  |  | Yes | Postal/ZIP code. |  |

Relationships:
- Many employees belong to one position.

Keys and Indexes:
- Primary Key: (id)
- Foreign Key: (positionId) → positions(id)
- Suggested Indexes: (email) UNIQUE; (positionId) for lookups/join performance

---

## Table: courses

- Purpose: Training courses catalog.

| Column | Data Type | PK | FK | Nullable | Description | References |
|-------|-----------|----|----|----------|-------------|------------|
| id | INT | Yes |  | No | Unique identifier for the course. |  |
| name | VARCHAR(255) |  |  | No (recommended) | Course name. |  |
| description | TEXT |  |  | Yes | Course description/content overview. |  |

Keys and Indexes:
- Primary Key: (id)

---

## Table: positioncourses

- Purpose: Associative table mapping positions to required/associated courses.

| Column | Data Type | PK | FK | Nullable | Description | References |
|-------|-----------|----|----|----------|-------------|------------|
| positionId | INT | Yes (composite) | Yes | No | Position identifier. | positions(id) |
| courseId | INT | Yes (composite) | Yes | No | Course identifier. | courses(id) |

Relationships:
- Many-to-many between positions and courses.

Keys and Indexes:
- Primary Key: (positionId, courseId)
- Foreign Keys: (positionId) → positions(id); (courseId) → courses(id)
- Suggested Indexes: (courseId, positionId) to support reverse lookups

---

## Table: employeetraining

- Purpose: Tracks employee participation in courses and completion status/date.

| Column | Data Type | PK | FK | Nullable | Description | References |
|-------|-----------|----|----|----------|-------------|------------|
| employeeId | BIGINT | Yes (composite) | Yes | No | Employee identifier. | employees(id) |
| courseId | INT | Yes (composite) | Yes | No | Course identifier. | courses(id) |
| completionDate | DATE |  |  | Yes | Date the employee completed the course; null if in-progress/not completed. |  |

Relationships:
- Many-to-many between employees and courses, with an attribute (completionDate).

Keys and Indexes:
- Primary Key: (employeeId, courseId)
- Foreign Keys: (employeeId) → employees(id); (courseId) → courses(id)
- Suggested Indexes: (courseId, employeeId), (completionDate)

---

## Relationship Summary (Cardinality)

- departments 1 ———< positions
- positions 1 ———< employees
- positions >———< courses via positioncourses
- employees >———< courses via employeetraining

---

## Assumptions and Recommendations

- Nullability is not explicit in the diagram. Above “No (recommended)” indicates typical constraints; adjust per business rules.
- Consider adding UNIQUE(employees.email).
- Consider ON DELETE/UPDATE behavior:
  - positions.departmentId → departments(id): RESTRICT or SET NULL (per policy).
  - employees.positionId → positions(id): RESTRICT (to avoid orphan employees) or SET NULL if positions can be vacated.
  - positioncourses and employeetraining FKs: ON DELETE CASCADE to clean up dependent rows when parent rows are removed.
- Consider adding created_at/updated_at audit columns where needed.
- Data types and lengths (e.g., VARCHAR sizes) are taken from the diagram or inferred. Adjust to your standards if different.
