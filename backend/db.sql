
drop database hr_tracking_db;
create database hr_tracking_db;
-- ===================================================
-- HR TRAINING TRACKER DATABASE
-- ===================================================
use	hr_tracking_db;
-- Drop existing tables (optional, for dev resets)
DROP TABLE IF EXISTS employeeTrainings;
DROP TABLE IF EXISTS positionCourses;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS departments;

-- Create Departments Table
CREATE TABLE departments (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Insert Data into Departments Table
INSERT INTO departments (id, name) VALUES
(1, 'IT Application & Data Services'),
(2, 'Head Start'),
(3, 'Corrections Education Division'),
(4, 'Occupational Safety & Health'),
(5, 'Special Academic Program'),
(6, 'Vice Pres Stu Services Office'),
(7, 'Business Info Tech-Bus Div'),
(8, 'Chemistry/STEM Div'),
(9, 'Family Life Education-HHS Div'),
(10, 'Sci/Tech/Eng/Math Div (STEM)'),
(11, 'Biology-STEM Div');

-- Create Positions Table
CREATE TABLE positions (
    id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    departmentId INT,
    FOREIGN KEY (departmentId) REFERENCES departments(id)
);

-- Insert Data into Positions Table
INSERT INTO positions (id, title, departmentId) VALUES
(1, 'IT Data Management - SR.', 1),
(2, 'EDUCATION SITE MANAGER', 2),
(3, 'ASSOC DEAN CORRECTIONS EDU', 3),
(4, 'DIRECTOR OSH PROGRAM', 4),
(5, 'DIR, SPECIAL ACADEMIC PROG', 5),
(6, 'EXEC ASST VP STU SUCCESS', 6),
(7, 'FULL TIME FACULTY - Business', 7),
(8, 'FULL TIME FACULTY - Chemistry', 8),
(9, 'FULL TIME FACULTY - Family Life', 9),
(10, 'DEAN SCI TECH ENG MATH DIV', 10),
(11, 'FULL TIME FACULTY - Biology', 11);

-- Create Employees Table
CREATE TABLE employees (
    id BIGINT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hireDate DATE NOT NULL,
    positionId INT,
    address1 VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    postal VARCHAR(20),
    FOREIGN KEY (positionId) REFERENCES positions(id)
);

-- Insert Data into Employees Table
INSERT INTO employees (id, firstName, lastName, email, hireDate, positionId, address1, city, state, postal) VALUES
(101000942, 'Elaine', 'Durham', 'Elaine.Durham@YourCollege.edu', '2020-08-15', 1, '14917 19TH AVE W', 'POST FALLS', 'ID', '83854'),
(101009472, 'Christopher', 'Osorio', 'Christopher.Osorio@SomeWhere.com', '2019-05-20', 2, '16510 76TH AVE W.', 'SULTA', 'WA', '98294'),
(101014387, 'Michael', 'Johanse', 'Michael.Johansen@YourCollege.edu', '2021-01-10', 3, '5832 136th St SE', 'EDMONDS', 'WA', '98026'),
(101017102, 'Theresa', 'Merry', 'Theresa.Merry@YourCollege.edu', '2022-06-01', 4, '19501 40th Ave W Unit 623', 'SEATTLE', 'WA', '98107'),
(101018013, 'Sharo', 'lden-Novak', 'Sharon.lden-Novak@YourCollege.edu', '2018-11-22', 5, '15305 Highway 99 Apt 25', 'SEATTLE', 'WA', '98115'),
(101020004, 'Linda', 'Liddell', 'Linda.Liddell@YourCollege.edu', '2017-03-14', 6, '7028 208th St SW Unit 4', 'EDMONDS', 'WA', '98026'),
(101021259, 'Catherine', 'Pa', 'Catherine.Pan@YourCollege.edu', '2023-09-01', 7, '2414 136th Pl SE', 'Hansville', 'WA', '98340-7762'),
(101021283, 'Heather', 'Edli', 'Heather.Edlin@YourCollege.edu', '2022-08-20', 8, '23711 45TH COURT WEST', 'SEATTLE', 'WA', '98125'),
(101021853, 'Verno', 'Burdick', 'Vernon.Burdick@SomeWhere.com', '2021-02-18', 9, '2530 187TH PLACE SE', 'EDMONDS', 'WA', '98020'),
(101022339, 'Tucker', 'nzalez', 'Tucker.nzalez@YourCollege.edu', '2023-07-15', 10, '19729 71ST PL W', 'SEATTLE', 'WA', '98177'),
(101022421, 'Amber', 'Martinez Hurtado', 'Amber.MartinezHurtado@YourCollege.edu', '2023-08-20', 8, '2412 200TH PLACE SW', 'LAKE FOREST PARK', 'WA', '98155'),
(101023474, 'Joan', 'Cossette', 'Joann.Cossette@YourCollege.edu', '2022-09-01', 11, '1093 DISCOVERY RIDGE RD', 'BOTHELL', 'WA', '98012');

-- Create Courses Table
CREATE TABLE courses (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Insert Data into Courses Table
INSERT INTO courses (id, name, description) VALUES
(1, 'Annual Security Training', 'Mandatory annual security and threat awareness training.'),
(2, 'Data Privacy Fundamentals (FERPA)', 'Understanding student data privacy regulations.'),
(3, 'Advanced Database Systems', 'Deep dive into database management and optimization.'),
(4, 'Student Support Services', 'Best practices for supporting student success.'),
(5, 'Leadership & Management Essentials', 'Core principles of effective leadership and team management.'),
(6, 'Workplace Safety (OSHA)', 'Guidelines for maintaining a safe work environment.'),
(7, 'Curriculum Design & Development', 'Principles of creating effective educational curricula.'),
(8, 'New Faculty Onboarding', 'Orientation and training for new faculty members.'),
(9, 'Financial Management for Deans', 'Budgeting and financial oversight for division leaders.');

-- Create PositionCourses Table
CREATE TABLE positionCourses (
    positionId INT,
    courseId INT,
    PRIMARY KEY (positionId, courseId),
    FOREIGN KEY (positionId) REFERENCES positions(id),
    FOREIGN KEY (courseId) REFERENCES courses(id)
);

-- Insert Data into PositionCourses Table
INSERT INTO positionCourses (positionId, courseId) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 4), (2, 5),
(3, 1), (3, 5), (3, 7),
(4, 1), (4, 5), (4, 6),
(5, 1), (5, 5),
(6, 1), (6, 2),
(7, 1), (7, 8),
(8, 1), (8, 8),
(9, 1), (9, 8),
(10, 1), (10, 5), (10, 9),
(11, 1), (11, 8);

-- Create EmployeeTrainings Table
CREATE TABLE employeeTrainings (
    employeeId BIGINT,
    courseId INT,
    completionDate DATE,
    PRIMARY KEY (employeeId, courseId),
    FOREIGN KEY (employeeId) REFERENCES employees(id),
    FOREIGN KEY (courseId) REFERENCES courses(id)
);

-- Insert Data into EmployeeTrainings Table
INSERT INTO employeeTrainings (employeeId, courseId, completionDate) VALUES
(101000942, 1, '2023-01-15'), (101000942, 2, '2023-03-20'),
(101009472, 1, '2023-02-10'), (101009472, 4, '2023-04-05'), (101009472, 5, '2023-06-11'),
(101014387, 5, '2023-05-18'),
(101017102, 1, '2023-07-01'), (101017102, 6, '2023-08-22'),
(101018013, 1, '2023-01-30'),
(101020004, 1, '2023-02-28'), (101020004, 2, '2023-03-15'),
(101021259, 1, '2023-10-05'), (101021259, 8, '2023-09-20'),
(101021283, 1, '2023-01-25');
