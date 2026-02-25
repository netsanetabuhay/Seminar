const Participant = require('../models/Participant');
const Meeting = require('../models/Meeting');

const participantController = {
    // Get all participants in a meeting
    getMeetingParticipants: async (req, res) => {
        try {
            const { meetingId } = req.params;
            const participants = await Participant.getByMeeting(meetingId);
            res.json({ success: true, participants });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Remove participant from meeting (host only)
    removeParticipant: async (req, res) => {
        try {
            const { meetingId, userId } = req.params;
            const hostId = req.user.id;

            // Check if requester is host
            const meeting = await Meeting.findById(meetingId);
            if (!meeting || meeting.host_id !== hostId) {
                return res.status(403).json({ message: 'Only host can remove participants' });
            }

            await Participant.remove(meetingId, userId);

            // Notify via socket
            const io = req.app.get('io');
            io.to(`meeting-${meetingId}`).emit('participant-removed', { userId });

            res.json({ success: true, message: 'Participant removed' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Check if user is in meeting
    checkParticipant: async (req, res) => {
        try {
            const { meetingId } = req.params;
            const userId = req.user.id;

            const isInMeeting = await Participant.isInMeeting(meetingId, userId);
            res.json({ success: true, isInMeeting });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = participantController;