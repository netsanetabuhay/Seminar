const meetingService = require('../services/meetingService');

const meetingController = {
    // Create new meeting
    createMeeting: async (req, res) => {
        try {
            const { title } = req.body;
            const hostId = req.user.id;

            const { meetingId, meetingCode } = await meetingService.createNewMeeting(hostId, title);
            const meeting = await meetingService.getCompleteMeetingDetails(meetingId);

            res.status(201).json({
                success: true,
                meeting: {
                    ...meeting.meeting,
                    meetingCode
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Join meeting
    joinMeeting: async (req, res) => {
        try {
            const { meetingCode } = req.body;
            const userId = req.user.id;

            const meeting = await meetingService.joinExistingMeeting(meetingCode, userId);
            const details = await meetingService.getCompleteMeetingDetails(meeting.id);

            res.json({
                success: true,
                meeting: details.meeting,
                participants: details.participants,
                chats: details.chats
            });

        } catch (error) {
            console.error(error);
            if (error.message === 'Meeting not found or inactive') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Get meeting details
    getMeetingDetails: async (req, res) => {
        try {
            const { meetingId } = req.params;
            const details = await meetingService.getCompleteMeetingDetails(meetingId);

            if (!details.meeting) {
                return res.status(404).json({ message: 'Meeting not found' });
            }

            res.json({
                success: true,
                meeting: details.meeting,
                participants: details.participants,
                chats: details.chats
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // End meeting (host only)
    endMeeting: async (req, res) => {
        try {
            const { meetingId } = req.params;
            const hostId = req.user.id;
            const io = req.app.get('io');

            await meetingService.endMeetingAndNotify(meetingId, hostId, io);

            res.json({
                success: true,
                message: 'Meeting ended successfully'
            });

        } catch (error) {
            console.error(error);
            if (error.message === 'Only host can end meeting') {
                return res.status(403).json({ message: error.message });
            }
            if (error.message === 'Meeting not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Leave meeting
    leaveMeeting: async (req, res) => {
        try {
            const { meetingId } = req.params;
            const userId = req.user.id;

            await meetingService.leaveMeeting(meetingId, userId);

            // Notify others
            const io = req.app.get('io');
            io.to(`meeting-${meetingId}`).emit('user-left', { userId });

            res.json({
                success: true,
                message: 'Left meeting successfully'
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Get user's meetings
    getUserMeetings: async (req, res) => {
        try {
            const userId = req.user.id;
            const meetings = await meetingService.getUserMeetingHistory(userId);
            res.json({ success: true, meetings });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = meetingController;