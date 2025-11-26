require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const db = require('./db');

const app = express();
app.get('/api/debug/position-courses', async (req, res) => {
  let knex;
  try {
    knex = require('./db').createLocalPool();
    const positions = await knex.select('*').from('positions');
    const courses = await knex.select('*').from('courses');
    const positioncourses = await knex.select('*').from('positioncourses');
    // Build mapping
    const mapping = positions.map((pos) => {
      const requiredCourseIds = positioncourses
        .filter((pc) => pc.positionId === pos.id)
        .map((pc) => pc.courseId);
      const requiredCourses = courses.filter((c) => requiredCourseIds.includes(c.id));
      return {
        positionId: pos.id,
        positionName: pos.name || pos.title || '',
        requiredCourseIds,
        requiredCourses: requiredCourses.map((c) => ({ id: c.id, name: c.name || c.title || '' })),
      };
    });
    await knex.destroy();
    res.json(mapping);
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    res.status(500).json({ error: err.message });
  }
});
const port = 3000;

app.use(cors());
app.use(express.json());

// --- Helper Functions (Business Logic) ---

function getRequiredCourseIdsForEmployee(employeeId) {
  const employee = db.employees.find((e) => e.id === employeeId);
  if (!employee) return [];

  const positionBasedIds = db.positioncourses
    .filter((pc) => pc.positionId === employee.positionId)
    .map((pc) => pc.courseId);

  const individualAssignedIds = db.employeetrainings
    .filter((ac) => ac.employeeId === employeeId)
    .map((ac) => ac.courseId);

  // Use a Set to ensure uniqueness
  return [...new Set([...positionBasedIds, ...individualAssignedIds])];
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
    const fullDetails = await Promise.all(
      employees.map(async (emp) => {
        const position = positions.find((p) => p.id === emp.positionId) || null;
        const department = position
          ? departments.find((d) => d.id === position.departmentId)
          : null;
        const trainingRecords = trainings.filter((t) => t.employeeId === emp.id);
        // Find required courses for this employee
        // Position-based required courses
        const positionCourseRows = await knex('positioncourses').where({
          positionId: emp.positionId,
        });
        const positionCourseIds = positionCourseRows.map((pc) => pc.courseId);

        // Individually assigned courses (from employeetrainings)
        const individualCourseIds = trainingRecords.map((tr) => tr.courseId);

        // Combine and deduplicate course IDs
        const allRequiredCourseIds = Array.from(
          new Set([...positionCourseIds, ...individualCourseIds])
        );
        const requiredCourses = courses.filter((c) => allRequiredCourseIds.includes(c.id));
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
      })
    );
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
    // Position-based required courses
    const positionCourseRows = await knex('positioncourses').where({ positionId: emp.positionId });
    const positionCourseIds = positionCourseRows.map((pc) => pc.courseId);

    // Individually assigned courses (from employeetrainings)
    const individualCourseIds = trainings.map((tr) => tr.courseId);

    // Combine and deduplicate course IDs
    const allRequiredCourseIds = Array.from(
      new Set([...positionCourseIds, ...individualCourseIds])
    );
    const requiredCourses = courses.filter((c) => allRequiredCourseIds.includes(c.id));
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
app.post('/api/assignments/positions', async (req, res) => {
  const { courseId, positionIds } = req.body;
  if (!courseId || !Array.isArray(positionIds)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }
  let knex;
  try {
    knex = createLocalPool();
    for (const positionId of positionIds) {
      const exists = await knex('positioncourses').where({ courseId, positionId }).first();
      if (!exists) {
        await knex('positioncourses').insert({ courseId, positionId });
      }
    }
    await knex.destroy();
    res.status(201).json({ message: 'Assignments created successfully' });
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// POST: Assign a course to employees
app.post('/api/assignments/employeetrainings', async (req, res) => {
  const { courseId, employeeIds } = req.body;
  if (!courseId || !Array.isArray(employeeIds)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }
  let knex;
  try {
    knex = createLocalPool();
    for (const employeeId of employeeIds) {
      const exists = await knex('employeetrainings').where({ courseId, employeeId }).first();
      if (!exists) {
        await knex('employeetrainings').insert({ courseId, employeeId });
      }
    }
    await knex.destroy();
    res.status(201).json({ message: 'Assignments created successfully' });
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// PUT: Upsert (insert if not exists, update if exists) for marking a course as completed for an employee
app.put('/api/employeetrainings', async (req, res) => {
  const { employeeId, courseId, completionDate } = req.body;
  if (!employeeId || !courseId || !completionDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  let knex;
  try {
    knex = createLocalPool();
    const exists = await knex('employeetrainings').where({ employeeId, courseId }).first();
    console.log('exists:', exists);
    if (exists) {
      await knex('employeetrainings').where({ employeeId, courseId }).update({ completionDate });
      await knex.destroy();
      return res.json({ message: 'Training marked as completed (updated)' });
    } else {
      await knex('employeetrainings').insert({ employeeId, courseId, completionDate });
      await knex.destroy();
      return res.json({ message: 'Training marked as completed (inserted)' });
    }
  } catch (err) {
    if (knex) await knex.destroy().catch(() => {});
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
