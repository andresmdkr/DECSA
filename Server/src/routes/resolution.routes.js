const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
  getResolutionsHandler,
  getResolutionByIdHandler,
  createResolutionHandler,
  updateResolutionHandler,
} = require('../handlers/resolution.handler.js');

const resolutionRouter = Router();


resolutionRouter.get('/', isAuthenticated, getResolutionsHandler);
resolutionRouter.get('/:resolutionId', isAuthenticated, getResolutionByIdHandler);
resolutionRouter.post('/sac/:sacId', isAuthenticated, createResolutionHandler); 
resolutionRouter.put('/:resolutionId', isAuthenticated, updateResolutionHandler); 

module.exports = resolutionRouter;
