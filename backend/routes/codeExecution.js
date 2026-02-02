const express = require("express");
const router = express.Router();
const codeExecutionController = require("../controllers/codeExecutionController");

// Code execution endpoints
router.post("/run", codeExecutionController.executeCode);
router.post("/execute", codeExecutionController.executeCode);
router.get("/languages", codeExecutionController.getLanguages);
router.get("/health", codeExecutionController.healthCheck);

module.exports = router;
