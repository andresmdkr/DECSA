const { Router } = require("express");
const {
  allTechnicalServicesHandler,
  byIdTechnicalServiceHandler,
  createTechnicalServiceHandler,
  updateTechnicalServiceHandler,
  deleteTechnicalServiceHandler,
} = require("../handlers/technicalService.handler.js");
const { isAuthenticated } = require('../middleware/authMiddleware');

const technicalServiceRouter = Router();


technicalServiceRouter.get("/", allTechnicalServicesHandler, isAuthenticated);
technicalServiceRouter.get("/:id", byIdTechnicalServiceHandler, isAuthenticated);
technicalServiceRouter.post("/", createTechnicalServiceHandler, isAuthenticated);
technicalServiceRouter.put("/:id", updateTechnicalServiceHandler, isAuthenticated);
technicalServiceRouter.delete("/:id", deleteTechnicalServiceHandler, isAuthenticated);

module.exports = technicalServiceRouter;
