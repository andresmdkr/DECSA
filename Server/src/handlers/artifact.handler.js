const { getArtifact, getArtifacts, updateArtifact } = require('../controllers/artifact.controller');

const getArtifactsHandler = async (req, res) => {
  try {
    const filters = req.query; 
    const artifacts = await getArtifacts(filters); 

    res.status(200).json({
      artifacts: artifacts.rows, 
      total: artifacts.count, 
      totalPages: Math.ceil(artifacts.count / (parseInt(filters.limit) || 10)),
      page: parseInt(filters.page) || 1,
      limit: parseInt(filters.limit) || 10,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getArtifactHandler = async (req, res) => {
  try {
    const artifactId = req.params.id;
    const artifact = await getArtifact(artifactId);

    if (!artifact) {
      return res.status(404).json({ message: 'Artifact not found' });
    }

    res.status(200).json(artifact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateArtifactHandler = async (req, res) => {
  try {
    const artifactId = req.params.id;
    const updatedData = req.body
    const updatedArtifact = await updateArtifact(artifactId, updatedData);

    if (!updatedArtifact) {
      return res.status(404).json({ message: 'Artifact not found' });
    }

    res.status(200).json(updatedArtifact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getArtifactHandler,
  getArtifactsHandler,
  updateArtifactHandler,
};
