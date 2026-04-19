const express = require("express");
const router  = express.Router();
const admin   = require("../controllers/adminController");
const { authenticate } = require("../middleware/auth");
const { requireRole }  = require("../middleware/roleCheck");

router.use(authenticate, requireRole("admin"));

router.get("/dashboard",        admin.getDashboardStats);
router.get("/users",            admin.getUsers);
router.patch("/users/:id",      admin.updateUserStatus);  // was PUT /users/:id/status
router.get("/jobs",             admin.getJobs);            // was getAllJobs
router.get("/skills",           admin.getSkills);
router.post("/skills",          admin.createSkill);
router.put("/skills/:id",       admin.updateSkill);
router.delete("/skills/:id",    admin.deleteSkill);        // added
router.get("/questions",        admin.getQuestions);
router.post("/questions",       admin.createQuestion);
router.put("/questions/:id",    admin.updateQuestion);
router.delete("/questions/:id", admin.deleteQuestion);
router.get("/payments",         admin.getPayments);
// generateReport removed — not in new controller

module.exports = router;