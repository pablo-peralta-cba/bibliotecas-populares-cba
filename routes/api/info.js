const express = require('express');
const router = express.Router();

// GET /api/info/legislacion - Legislation info (static content, React has the full page)
router.get('/legislacion', (req, res) => {
  res.json({
    title: 'Legislación',
    description: 'Marco legal de las Bibliotecas Populares en Córdoba, Argentina',
  });
});

module.exports = router;
