const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Program = require("../models/Program");
const Assessment = require("../models/Assessment");
const Educator = require("../models/Educator");

// Middleware to check if user is educator
const isEducator = (req, res, next) => {
  if (req.session.user && req.session.user.role === "educator") {
    next();
  } else {
    res.redirect("/");
  }
};

router.use(isEducator);

// Educator Dashboard
router.get("/:educatorId/dashboard", async (req, res) => {
  try {
    const { educatorId } = req.params;

    // Find educator and populate their programs with full details
    const educator = await Educator.findById(educatorId).populate({
      path: "programs",
      select: "programName program_id duration weekly monthly quarterly",
    });

    if (!educator) {
      return res.status(404).send("Educator not found");
    }

    // Fetch assessments for each program
    const programsWithAssessments = await Promise.all(
      educator.programs.map(async (program) => {
        const assessments = await Assessment.find({
          programId: program._id,
        });

        return {
          ...program.toObject(),
          assessments: assessments,
        };
      })
    );

    res.render("educator/dashboard", {
      educator,
      programs: programsWithAssessments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Students Page
router.get("/students", async (req, res) => {
  try {
    const { programId, educatorId, year } = req.query;

    // Validate input
    if (!programId || !educatorId || !year) {
      return res.status(400).send("Missing required parameters");
    }

    // Find the program with full details
    const program = await Program.findById(programId).lean();

    if (!program) {
      return res.status(403).send("Program not found");
    }

    // Fetch students based on program and year
    const students = await Student.find({
      programId: programId,
      enrollmentYear: parseInt(year),
    }).lean();

    // Fetch recent assessments for these students
    const studentIds = students.map((student) => student._id);
    const recentAssessments = await Assessment.find({
      studentId: { $in: studentIds },
      programId: programId,
    }).lean();

    // Attach assessments to students
    const studentsWithAssessments = students.map((student) => ({
      ...student,
      assessments: recentAssessments.filter(
        (assessment) =>
          assessment.studentId.toString() === student._id.toString()
      ),
    }));

    // Prepare programs array with full program details
    const programWithDetails = {
      ...program,
      weekly: program.weekly || [],
      monthly: program.monthly || [],
      quarterly: program.quarterly || [],
    };

    res.render("educator/students", {
      students: studentsWithAssessments,
      programs: [programWithDetails],
      educator: { _id: educatorId },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).send("Internal Server Error");
  }
});
const requestLogger = (req, res, next) => {
  console.log("Request Body:", req.body);
  console.log("Request Path:", req.path);
  next();
};
router.post("/assessment/add", async (req, res) => {
  try {
    const { studentId, programId, type, assessmentName, score, comments } =
      req.body;

    // Validate input
    if (
      !studentId ||
      !programId ||
      !type ||
      !assessmentName ||
      score === undefined
    ) {
      return res.status(400).send("Missing required fields");
    }

    // Ensure valid score range
    if (score < 0 || score > 5) {
      return res.status(400).send("Score must be between 0 and 5");
    }

    // Check if student and program exist
    const student = await Student.findById(studentId);
    const program = await Program.findById(programId);
    if (!student || !program) {
      return res.status(404).send("Student or Program not found");
    }

    // Create new assessment
    const newAssessment = new Assessment({
      studentId,
      programId,
      type,
      assessmentName,
      score,
      comments,
    });

    // Save assessment
    await newAssessment.save();

    res.redirect(
      "/educator/students?programId=" +
        programId +
        "&educatorId=" +
        req.session.user._id +
        "&year=" +
        student.enrollmentYear
    );
  } catch (error) {
    console.error("Error adding assessment:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
// // Add Assessment Route
// router.post("/assessment/add", requestLogger, async (req, res) => {
//   try {
//     const { studentId, programId, type, assessmentName, score, comments } =
//       req.body;
//     console.log(req.body);
//     // Validate inputs
//     if (!studentId) {
//       return res.status(400).send("Student ID is required");
//     }
//     if (!programId) {
//       return res.status(400).send("Program ID is required");
//     }
//     if (!type) {
//       return res.status(400).send("Assessment type is required");
//     }
//     if (!assessmentName) {
//       return res.status(400).send("Assessment name is required");
//     }

//     // Verify student exists
//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).send("Student not found");
//     }

//     // Verify program exists
//     const program = await Program.findById(programId);
//     if (!program) {
//       return res.status(404).send("Program not found");
//     }

//     // Create new assessment
//     const assessment = new Assessment({
//       studentId,
//       programId,
//       type,
//       assessmentName,
//       score: parseFloat(score) || 0,
//       comments: comments || "",
//       dateCreated: new Date(),
//     });

//     // Save assessment
//     await assessment.save();

//     // Redirect back with success message (requires connect-flash middleware)
//     req.flash("success", "Assessment added successfully");
//     res.redirect("back");
//   } catch (error) {
//     console.error("Error adding assessment:", error);

//     // Send detailed error response
//     res.status(500).send({
//       message: "Error adding assessment",
//       error: error.message,
//     });
//   }
// });

// const express = require("express");
// const router = express.Router();
// const Student = require("../models/Student");
// const Program = require("../models/Program");
// const Assessment = require("../models/Assessment");
// const Educator = require("../models/Educator"); // Make sure the path is correct

// // Middleware to check if user is educator
// const isEducator = (req, res, next) => {
//   if (req.session.user && req.session.user.role === "educator") {
//     next();
//   } else {
//     res.redirect("/");
//   }
// };

// router.use(isEducator);

// // Educator Dashboard
// router.get("/:educatorId/dashboard", async (req, res) => {
//   try {
//     const { educatorId } = req.params;

//     // Find educator and populate their programs
//     const educator = await Educator.findById(educatorId).populate("programs");

//     if (!educator) {
//       return res.status(404).send("Educator not found");
//     }
//     console.log(educator.programs);
//     res.render("educator/dashboard", { educator, programs: educator.programs });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// router.get("/educator/students", async (req, res) => {
//   try {
//     const { programId, educatorId, year } = req.query;

//     console.log("Received Query Params:", { programId, educatorId, year });

//     if (!programId || !educatorId) {
//       console.log("Missing required parameters.");
//       return res.status(400).send("Missing programId or educatorId");
//     }

//     // Find the program and verify educator's access
//     const program = await Program.findOne({
//       _id: programId,
//       $or: [{ primaryEducator: educatorId }, { secondaryEducator: educatorId }],
//     }).populate("assessments");

//     console.log("Fetched Program:", program);

//     if (!program) {
//       console.log("Access denied. Educator is not assigned to this program.");
//       return res
//         .status(403)
//         .send("Access denied. You are not an educator for this program.");
//     }

//     // Fetch students based on program and year
//     const students = await Student.find({
//       program_id: programId,
//       enrollmentYear: year,
//     });

//     console.log("Fetched Students:", students);

//     // Render the students view directly
//     res.render("educator/students", {
//       students,
//       programs: [program],
//       educator: { _id: educatorId },
//     });
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// router.get("/educator/students/:programId/:year", async (req, res) => {
//   try {
//     const { programId, year } = req.params;
//     const educatorId = req.session.user._id; // Educator's ID from session

//     // Check if educator is assigned to this program
//     const program = await Program.findOne({
//       _id: programId,
//       $or: [{ primaryEducator: educatorId }, { secondaryEducator: educatorId }],
//     }).populate("assessments"); // Populate assessments if needed

//     if (!program) {
//       return res
//         .status(403)
//         .send("Access denied. You are not an educator for this program.");
//     }

//     // Fetch students in the specified program and year
//     const students = await Student.find({
//       programId: programId,
//       enrollmentYear: year,
//     }).populate("programId");

//     res.render("educator/students", { students, programs: [program] }); // Send students & program data to students.ejs
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching students");
//   }
// });

// // router.get('/educator/students/:programId/:year', async (req, res) => {
// //   try {
// //     const { programId, year } = req.params;
// //     const educatorId = req.session.user._id; // Assuming educator's ID is stored in session

// //     // Find programs where the educator is either primary or secondary
// //     const program = await Program.findOne({
// //       _id: programId,
// //       $or: [{ primaryEducator: educatorId }, { secondaryEducator: educatorId }]
// //     });

// //     if (!program) {
// //       return res.status(403).send('Access denied. You are not an educator for this program.');
// //     }

// //     // Find students in the program and enrollment year
// //     const students = await Student.find({
// //       programId: programId,
// //       enrollmentYear: year
// //     }).populate('programId');

// //     res.render('educator/students', { students });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).send('Error fetching students');
// //   }
// // });

// // Add assessment
// // router.post('/assessment/add', async (req, res) => {
// //   try {
// //     const assessment = new Assessment(req.body);
// //     await assessment.save();
// //     res.redirect('back');
// //   } catch (error) {
// //     res.status(500).send('Error adding assessment');
// //   }
// // });
// router.post("/assessment/add", async (req, res) => {
//   try {
//     const { studentId, programId, type, assessmentName, score, comments } =
//       req.body;

//     const assessment = new Assessment({
//       studentId,
//       programId,
//       type,
//       assessmentName,
//       score,
//       comments,
//     });

//     await assessment.save();
//     res.redirect("back");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error adding assessment");
//   }
// });

// module.exports = router;
