const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const { getArtifactHandler,getArtifactsHandler, updateArtifactHandler } = require('../handlers/artifact.handler');

const artifactRouter = Router();

artifactRouter.get('/:id', isAuthenticated, getArtifactHandler);
artifactRouter.get('/', isAuthenticated, getArtifactsHandler);
artifactRouter.put('/:id', isAuthenticated, updateArtifactHandler);

module.exports = artifactRouter;
