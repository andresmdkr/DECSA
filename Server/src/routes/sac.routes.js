const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const { createSACHandler, getSACsHandler,updateSACHandler,getResolutionHandler,createResolutionHandler,updateResolutionHandler } = require('../handlers/sac.handler');

const sacRouter = Router();

sacRouter.post('/', isAuthenticated, createSACHandler);
sacRouter.get('/', isAuthenticated, getSACsHandler);
sacRouter.put('/:id', isAuthenticated, updateSACHandler);
sacRouter.get('/:sacId/resolution', isAuthenticated, getResolutionHandler);
sacRouter.post('/:sacId/resolution', isAuthenticated, createResolutionHandler);
sacRouter.put('/:sacId/resolution/:resolutionId', isAuthenticated, updateResolutionHandler);

module.exports = sacRouter;
