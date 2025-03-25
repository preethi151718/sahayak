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

router.get("/students/:id", async (req, res) => {
  const student = await Student.findById(req.params.id).populate(
    "programId educator secondaryEducator"
  );
  res.render("admin/view", { student });
});

// Edit Student Page
router.get("/students/edit/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  const programs = await Program.find();
  const educators = await Educator.find();
  res.render("admin/edit", { student, programs, educators });
});

router.post("/students/update/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    // Convert checkboxes to an array
    if (!Array.isArray(req.body.daysOfWeek)) {
      req.body.daysOfWeek = req.body.daysOfWeek ? [req.body.daysOfWeek] : [];
    }

    // Update the student
    await Student.findByIdAndUpdate(studentId, {
      studentId: req.body.studentId,
      name: req.body.name,
      profileImage: req.body.profileImage, // ✅ Ensure profile image is saved
      status: req.body.status,
      programId: req.body.programId,
      daysOfWeek: req.body.daysOfWeek, // ✅ Ensures array is saved properly
      educator: req.body.educator,
      secondaryEducator: req.body.secondaryEducator || null,
      sessionType: req.body.sessionType,
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      contactNo: req.body.contactNo,
      alternativeContactNo: req.body.alternativeContactNo,
      parentEmail: req.body.parentEmail,
      address: req.body.address,
      transport: req.body.transport,
      comments: req.body.comments,
      enrollmentYear: req.body.enrollmentYear,
    });

    res.redirect(`/admin/students`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating student");
  }
});

router.delete("/programs/delete/:id", async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// View Educator Details
router.get("/educators/:id", async (req, res) => {
  try {
    const educator = await Educator.findById(req.params.id).populate(
      "programs"
    );
    res.render("admin/viewEducator", { educator });
  } catch (error) {
    res.status(500).send("Error fetching educator details");
  }
});

// Edit Educator Page
router.get("/educators/edit/:id", async (req, res) => {
  try {
    const educator = await Educator.findById(req.params.id);
    const programs = await Program.find();
    if (!educator) {
      return res.status(404).send("Educator not found");
    }
    res.render("admin/editEducator", { educator, programs });
  } catch (error) {
    res.status(500).send("Error fetching educator details");
  }
});

// Update Educator
router.post("/educators/update/:id", async (req, res) => {
  try {
    await Educator.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      email: req.body.email,
      phoneNo: req.body.phoneNo,
      experienceYears: req.body.experienceYears,
      bio: req.body.bio,
      qualifications: req.body.qualifications,
      profileImage: req.body.profileImage,
      programs: req.body.programs || [], // Ensure it's always an array
    });
    res.redirect("/admin/educators");
  } catch (error) {
    res.status(500).send("Error updating educator");
  }
});
// View a program
router.get("/programs/view/:id", async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    res.render("admin/viewProgram", { program });
  } catch (error) {
    res.status(500).send("Error retrieving program");
  }
});

// Edit a program (GET form)
router.get("/programs/edit/:id", async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    res.render("admin/editProgram", { program });
  } catch (error) {
    res.status(500).send("Error retrieving program for editing");
  }
});

// Update a program (POST)
router.post("/programs/update/:id", async (req, res) => {
  try {
    await Program.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin/programs/view/" + req.params.id);
  } catch (error) {
    res.status(500).send("Error updating program");
  }
});

module.exports = router;
