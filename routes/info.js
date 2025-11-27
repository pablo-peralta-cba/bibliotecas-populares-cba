const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
// const ExpressError = require('../utilities/expressError');
const infor = require('../controllers/infoCont');

router.route('/legislacion').get(catchAsync(infor.legis));

module.exports = router;
