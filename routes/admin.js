const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Educator = require("../models/Educator");
const Program = require("../models/Program");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    res.redirect("/");
  }
};

router.use(isAdmin);

// Admin Dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalEducators = await Educator.countDocuments();
    const totalPrograms = await Program.countDocuments();

    res.render("admin/dashboard", {
      totalStudents,
      totalEducators,
      totalPrograms,
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Student Management
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find().populate("programId");
    const programs = await Program.find();
    const educators = await Educator.find();
    res.render("admin/students", { students, programs, educators });
  } catch (error) {
    res.status(500).send("Error fetching students");
  }
});

router.post("/students/add", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging log
    const student = new Student(req.body);
    await student.save();
    res.redirect("/admin/students");
  } catch (error) {
    console.error("Error adding student:", error); // Log the error for debugging
    res.status(500).send("Error adding student");
  }
});

router.get("/students/filter", async (req, res) => {
  try {
    const query = {};
    if (req.query.program) query.programId = req.query.program;
    if (req.query.year) query.enrollmentYear = parseInt(req.query.year);

    const students = await Student.find(query).populate("programId");
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Error filtering students" });
  }
});

// Educator Management
router.get("/educators", async (req, res) => {
  try {
    const educators = await Educator.find().populate("programs");
    const programs = await Program.find();
    res.render("admin/educators", { educators, programs });
  } catch (error) {
    res.status(500).send("Error fetching educators");
  }
});

router.post("/educators/add", async (req, res) => {
  try {
    const educator = new Educator(req.body);
    await educator.save();
    res.redirect("/admin/educators");
  } catch (error) {
    res.status(500).send("Error adding educator");
  }
});

router.get("/educators/filter", async (req, res) => {
  try {
    const query = {};
    if (req.query.program) {
      query.programs = req.query.program;
    }

    const educators = await Educator.find(query).populate("programs");
    res.json(educators);
  } catch (error) {
    res.status(500).json({ error: "Error filtering educators" });
  }
});

// Program Management
router.get("/programs", async (req, res) => {
  try {
    const programs = await Program.find();
    res.render("admin/programs", { programs });
  } catch (error) {
    res.status(500).send("Error fetching programs");
  }
});

router.post("/programs/add", async (req, res) => {
  try {
    const program = new Program({
      program_id: req.body.program_id,
      programName: req.body.programName,
      duration: req.body.duration,
      weekly: req.body.weekly,
      monthly: req.body.monthly,
      quarterly: req.body.quarterly,
    });
    await program.save();
    res.redirect("/admin/programs");
  } catch (error) {
    res.status(500).send("Error adding program");
  }
});

// Delete routes
router.delete("/students/delete/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.delete("/educators/delete/:id", async (req, res) => {
  try {
    await Educator.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// View Student Details
router.get("/admin/students/:id", async (req, res) => {
  const student = await Student.findById(req.params.id).populate(
    "programId educator secondaryEducator"
  );
  res.render("view", { student });
});

// Edit Student Page
router.get("/admin/students/edit/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  const programs = await Program.find();
  const educators = await Educator.find();
  res.render("edit", { student, programs, educators });
});

// Update Student
router.post("/admin/students/update/:id", async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/admin/students");
});

router.delete("/programs/delete/:id", async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
