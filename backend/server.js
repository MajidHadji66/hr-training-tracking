require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const db = require('./db');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- Helper Functions (Business Logic) ---

function getRequiredCourseIdsForEmployee(employeeId) {
  const employee = db.employees.find((e) => e.id === employeeId);
  if (!employee) return [];

  const positionBasedIds = db.positionCourses
    .filter((pc) => pc.positionId === employee.positionId)
    .map((pc) => pc.courseId);

  const individualAssignedIds = db.employeeCourseAssignments
    .filter((ac) => ac.employeeId === employeeId)
    .map((ac) => ac.courseId);

  // Use a Set to ensure uniqueness
  return [...new Set([...positionBasedIds, ...individualAssignedIds])];
}

function getEmployeeFullDetailsById(id) {
  const employee = db.employees.find((e) => e.id === id);
  if (!employee) return null;

  const position = db.positions.find((p) => p.id === employee.positionId);
  if (!position) return null;

  const department = db.departments.find((d) => d.id === position.departmentId);
  if (!department) return null;

  const trainingRecords = db.employeeTrainings.filter((t) => t.employeeId === employee.id);
  const requiredCourseIds = getRequiredCourseIdsForEmployee(employee.id);

  const requiredCourses = db.courses.filter((c) => requiredCourseIds.includes(c.id));

  const completedCount = requiredCourses.filter((rc) =>
    trainingRecords.some((tr) => tr.courseId === rc.id)
  ).length;

  const completionPercentage =
    requiredCourses.length > 0 ? (completedCount / requiredCourses.length) * 100 : 100;

  return {
    ...employee,
    position,
    department,
    trainingRecords,
    requiredCourses,
    completionPercentage,
  };
}

// --- API Endpoints ---

// GET all basic employee info
app.get('/api/employees', (req, res) => {
  // Try database first, fall back to in-memory data
  (async () => {
    let knex;
    try {
      knex = createLocalPool();
      const hasTable = await knex.schema.hasTable('employees');
      if (hasTable) {
        const rows = await knex.select('*').from('employees').limit(1000);
        await knex.destroy();
        return res.json(rows);
      }
    } catch (err) {
      console.warn('DB employees query failed, falling back to static data:', err.message);
      if (knex) await knex.destroy().catch(() => {});
    }
    res.json(db.employees);
  })();
});

// GET all detailed employee info
const { createLocalPool } = require('./db');

app.get('/api/employees/details', async (req, res) => {
  let knex;
  try {
    knex = db.createLocalPool();
    // Get all employees
    const employees = await knex.select('*').from('employees');
    // console.log('DB employees:', employees);
    // Get all positions
    const positions = await knex.select('*').from('positions');
    // Get all departments
    const departments = await knex.select('*').from('departments');
    // Get all trainings
    const trainings = await knex.select('*').from('employeetrainings');
    // Get all courses
    const courses = await knex.select('*').from('courses');

    // Build full details for each employee
    const fullDetails = employees.map((emp) => {
      const position = positions.find((p) => p.id === emp.positionId) || null;
      const department = position ? departments.find((d) => d.id === position.departmentId) : null;
      const trainingRecords = trainings.filter((t) => t.employeeId === emp.id);
      // Find required courses for this employee
      // For now, just assign all courses (customize as needed)
      const requiredCourses = courses;
      const completedCount = requiredCourses.filter((rc) =>
        trainingRecords.some((tr) => tr.courseId === rc.id)
      ).length;
      const completionPercentage =
        requiredCourses.length > 0 ? (completedCount / requiredCourses.length) * 100 : 100;
      return {
        ...emp,
        position,
        department,
        trainingRecords,
        requiredCourses,
        completionPercentage,
      };
    });
    await knex.destroy();
    res.json(fullDetails);
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    // console.error('Error in /api/employees/details:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET a single employee's detailed info
app.get('/api/employees/:id/details', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  let knex;
  try {
    knex = db.createLocalPool();
    // Get the employee
    const employees = await knex('employees').where({ id });
    if (!employees.length) {
      await knex.destroy();
      return res.status(404).json({ message: 'Employee not found' });
    }
    const emp = employees[0];
    // Get all positions
    const positions = await knex.select('*').from('positions');
    // Get all departments
    const departments = await knex.select('*').from('departments');
    // Get all trainings for this employee
    const trainings = await knex('employeetrainings').where({ employeeId: id });
    // Get all courses
    const courses = await knex.select('*').from('courses');

    const position = positions.find((p) => p.id === emp.positionId) || null;
    const department = position ? departments.find((d) => d.id === position.departmentId) : null;
    // For now, just assign all courses (customize as needed)
    const requiredCourses = courses;
    const completedCount = requiredCourses.filter((rc) =>
      trainings.some((tr) => tr.courseId === rc.id)
    ).length;
    const completionPercentage =
      requiredCourses.length > 0 ? (completedCount / requiredCourses.length) * 100 : 100;
    const details = {
      ...emp,
      position,
      department,
      trainingRecords: trainings,
      requiredCourses,
      completionPercentage,
    };
    await knex.destroy();
    res.json(details);
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// GET all courses for a specific employee
app.get('/api/employees/:id/courses', async (req, res) => {
  const employeeId = parseInt(req.params.id, 10);
  let knex;
  try {
    knex = db.createLocalPool();
    // Get all courses
    const courses = await knex.select('*').from('courses');
    // Get all trainings for this employee
    const trainings = await knex('employeetrainings').where({ employeeId });
    // For now, just assign all courses (customize as needed)
    const employeeCourses = courses.map((course) => {
      const trainingRecord = trainings.find((tr) => tr.courseId === course.id);
      return {
        ...course,
        completionDate: trainingRecord ? trainingRecord.completionDate : null,
        status: trainingRecord ? 'Completed' : 'Pending',
      };
    });
    await knex.destroy();
    res.json(employeeCourses);
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// GET all courses
app.get('/api/courses', (req, res) => {
  (async () => {
    let knex;
    try {
      knex = createLocalPool();
      const hasTable = await knex.schema.hasTable('courses');
      if (hasTable) {
        const rows = await knex.select('*').from('courses').limit(1000);
        await knex.destroy();
        return res.json(rows);
      }
    } catch (err) {
      console.warn('DB courses query failed, falling back to static data:', err.message);
      if (knex) await knex.destroy().catch(() => {});
    }
    res.json(db.courses);
  })();
});

// GET all positions
app.get('/api/positions', (req, res) => {
  (async () => {
    let knex;
    try {
      knex = createLocalPool();
      const hasTable = await knex.schema.hasTable('positions');
      if (hasTable) {
        const rows = await knex.select('*').from('positions').limit(1000);
        await knex.destroy();
        return res.json(rows);
      }
    } catch (err) {
      console.warn('DB positions query failed, falling back to static data:', err.message);
      if (knex) await knex.destroy().catch(() => {});
    }
    res.json(db.positions);
  })();
});

// GET all employees assigned to a course
app.get('/api/courses/:id/employees', async (req, res) => {
  const courseId = parseInt(req.params.id, 10);
  let knex;
  try {
    knex = db.createLocalPool();
    // Find all positions that require this course
    const positionCourseRows = await knex('positioncourses').where({ courseId });
    const requiredPositionIds = positionCourseRows.map((pc) => pc.positionId);

    // Find all employees with those positions
    let positionBasedEmployees = [];
    if (requiredPositionIds.length) {
      positionBasedEmployees = await knex('employees').whereIn('positionId', requiredPositionIds);
    }

    // Find all employees individually assigned this course
    // If you have a table for individual assignments, update the table name below
    let individualAssignedEmployeeIds = [];
    if (await knex.schema.hasTable('employeecourseassignments')) {
      const assignmentRows = await knex('employeecourseassignments').where({ courseId });
      individualAssignedEmployeeIds = assignmentRows.map((ac) => ac.employeeId);
    }
    let individualEmployees = [];
    if (individualAssignedEmployeeIds.length) {
      individualEmployees = await knex('employees').whereIn('id', individualAssignedEmployeeIds);
    }

    // Combine and deduplicate
    const allEmployees = [...positionBasedEmployees, ...individualEmployees];
    const uniqueEmployees = Array.from(new Set(allEmployees.map((e) => e.id))).map((id) =>
      allEmployees.find((e) => e.id === id)
    );

    await knex.destroy();
    res.json(uniqueEmployees);
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// GET all position IDs for a course
app.get('/api/courses/:id/positions', async (req, res) => {
  const courseId = parseInt(req.params.id, 10);
  let knex;
  try {
    knex = db.createLocalPool();
    // Replace 'positioncourses' with your actual table name if different
    const rows = await knex('positioncourses').where({ courseId });
    const positionIds = rows.map((pc) => pc.positionId);
    await knex.destroy();
    res.json(positionIds);
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// POST: Assign a course to positions
app.post('/api/assignments/positions', (req, res) => {
  const { courseId, positionIds } = req.body;
  if (!courseId || !Array.isArray(positionIds)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  positionIds.forEach((positionId) => {
    const exists = db.positionCourses.some(
      (pc) => pc.courseId === courseId && pc.positionId === positionId
    );
    if (!exists) {
      db.positionCourses.push({ courseId, positionId });
    }
  });

  res.status(201).json({ message: 'Assignments created successfully' });
});

// POST: Assign a course to employees
app.post('/api/assignments/employees', (req, res) => {
  const { courseId, employeeIds } = req.body;
  if (!courseId || !Array.isArray(employeeIds)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  employeeIds.forEach((employeeId) => {
    const exists = db.employeeCourseAssignments.some(
      (ac) => ac.courseId === courseId && ac.employeeId === employeeId
    );
    if (!exists) {
      db.employeeCourseAssignments.push({ courseId, employeeId });
    }
  });

  res.status(201).json({ message: 'Assignments created successfully' });
});

// POST: Analyze training data with Gemini
app.post('/api/analyze-training', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  if (!process.env.API_KEY) {
    return res.status(500).json({
      message:
        'API_KEY environment variable not set on the server. Please create a .env file in the /backend directory with your API key.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ analysis: response.text });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ message: 'Failed to generate analysis from the Gemini API.' });
  }
});

app.listen(port, () => {
  console.log(`HR Training Tracker backend listening at http://localhost:${port}`);
});

// Simple endpoint to test DB connectivity explicitly
app.get('/api/test-db', async (req, res) => {
  let knex;
  try {
    knex = createLocalPool();
    const result = await knex.raw('SELECT 1 + 1 AS result');
    // mysql2/Knex returns rows in result[0] for raw queries
    const value = Array.isArray(result) && result[0] && result[0][0] ? result[0][0].result : null;
    await knex.destroy();
    return res.json({ ok: true, result: value });
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    console.error('Database connection error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});
