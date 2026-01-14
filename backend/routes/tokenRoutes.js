const router = require('express').Router();
const Token = require('../models/Token');


router.post('/generate', async (req, res) => {
const io = req.app.get('io');
const count = await Token.countDocuments({ serviceId: req.body.serviceId });


const token = await Token.create({
serviceId: req.body.serviceId,
studentId: req.body.studentId,
number: count + 1
});


io.emit('queueUpdate', token);
res.json(token);
});


router.put('/next/:id', async (req, res) => {
const io = req.app.get('io');
const token = await Token.findByIdAndUpdate(req.params.id, { status: 'serving' });


io.emit('tokenCalled', token);
res.json(token);
});


module.exports = router;