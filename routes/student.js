const express = require("express");
const router = express.Router();
const Assessment = require("../models/Assessment");
const Student = require("../models/Student");
const mongoose = require("mongoose");

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.session.user && req.session.user.role === "student") {
    next();
  } else {
    res.redirect("/");
  }
};

router.use(isStudent);

// Student Dashboard (Fetch all assessments)
router.get("/dashboard", async (req, res) => {
  try {
    const student = await Student.findOne({
      parentEmail: req.session.user.email,
    });

    if (!student) {
      console.log("Student not found for email:", req.session.user.email);
      return res.status(404).send("Student not found");
    }

    // Find assessments using student._id
    const assessments = await Assessment.find({
      studentId: student._id,
    }).lean();

    res.render("student/dashboard", { assessments });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Fetch assessments by type (weekly, monthly, quarterly)
router.get("/assessments/:type", async (req, res) => {
  try {
    const { type } = req.params;

    if (!["weekly", "monthly", "quarterly"].includes(type)) {
      return res.status(400).send("Invalid assessment type");
    }

    // Get student details using email
    const student = await Student.findOne({
      parentEmail: req.session.user.email,
    });

    if (!student) {
      console.log("Student not found for email:", req.session.user.email);
      return res.status(404).send("Student not found");
    }

    console.log("Fetching assessments for:", { studentId: student._id, type });

    // Find assessments using student._id
    const assessments = await Assessment.find({
      studentId: new mongoose.Types.ObjectId(student._id),
      type,
    }).lean();

    console.log("Assessments retrieved:", assessments);

    res.render("student/assessments", { assessments, type });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const Assessment = require("../models/Assessment");
// const Student = require("../models/Student");

// // Middleware to check if user is a student
// const isStudent = (req, res, next) => {
//   if (req.session.user && req.session.user.role === "student") {
//     next();
//   } else {
//     res.redirect("/");
//   }
// };

// router.use(isStudent);

// // Student Dashboard (Fetch all assessments)
// router.get("/dashboard", async (req, res) => {
//   try {
//     const studentId = req.session.user._id;

//     // Find student and populate assessments
//     const assessments = await Assessment.find({ studentId }).lean();

//     res.render("student/dashboard", { assessments });
//   } catch (error) {
//     console.error("Error loading dashboard:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Fetch assessments by type (weekly, monthly, quarterly)
// const mongoose = require("mongoose");

// router.get("/assessments/:type", async (req, res) => {
//   try {
//     const { type } = req.params;
//     const studentId = req.session.user._id;

//     console.log("Fetching assessments for:", { studentId, type });

//     if (!["weekly", "monthly", "quarterly"].includes(type)) {
//       return res.status(400).send("Invalid assessment type");
//     }

//     // Convert studentId to ObjectId
//     const assessments = await Assessment.find({
//       studentId: new mongoose.Types.ObjectId(studentId),
//       type,
//     }).lean();

//     console.log("Assessments retrieved:", assessments);

//     res.render("student/assessments", { assessments, type });
//   } catch (error) {
//     console.error("Error fetching assessments:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const Assessment = require('../models/Assessment');

// // Middleware to check if user is student
// const isStudent = (req, res, next) => {
//   if (req.session.user && req.session.user.role === 'student') {
//     next();
//   } else {
//     res.redirect('/');
//   }
// };

// router.use(isStudent);

// // Student Dashboard
// router.get('/dashboard', async (req, res) => {
//   try {
//     const assessments = await Assessment.find({ studentId: req.session.user._id })
//       .populate('programId');
//     res.render('student/dashboard', { assessments });
//   } catch (error) {
//     res.status(500).send('Server error');
//   }
// });

// // Get assessments by type
// router.get('/assessments/:type', async (req, res) => {
//   try {
//     const assessments = await Assessment.find({
//       studentId: req.session.user._id,
//       type: req.params.type
//     }).populate('programId');
//     res.render('student/assessments', { assessments });
//   } catch (error) {
//     res.status(500).send('Error fetching assessments');
//   }
// });

// module.exports = router;
