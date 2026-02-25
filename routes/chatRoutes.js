const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/meeting/:meetingId', chatController.getMeetingChats);
router.post('/send', chatController.sendMessage);
router.delete('/message/:messageId', chatController.deleteMessage);

module.exports = router;