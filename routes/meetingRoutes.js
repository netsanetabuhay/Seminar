const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create', meetingController.createMeeting);
router.post('/join', meetingController.joinMeeting);
router.get('/user/history', meetingController.getUserMeetings);
router.get('/:meetingId', meetingController.getMeetingDetails);
router.put('/:meetingId/end', meetingController.endMeeting);
router.post('/:meetingId/leave', meetingController.leaveMeeting);

module.exports = router;