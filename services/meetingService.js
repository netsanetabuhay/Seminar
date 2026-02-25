const Meeting = require('../models/Meeting');
const Participant = require('../models/Participant');
const Chat = require('../models/Chat');
const generateMeetingCode = require('../utils/generateMeetingCode');

const meetingService = {
    // Create new meeting with unique code
    createNewMeeting: async (hostId, title = 'Untitled Meeting') => {
        // Generate unique meeting code
        let meetingCode;
        let existingMeeting;
        do {
            meetingCode = generateMeetingCode();
            existingMeeting = await Meeting.findByCode(meetingCode);
        } while (existingMeeting);

        // Create meeting
        const meetingId = await Meeting.create(meetingCode, hostId, title);

        // Add host as participant
        await Participant.add(meetingId, hostId);

        return { meetingId, meetingCode };
    },

    // Join meeting with validation
    joinExistingMeeting: async (meetingCode, userId) => {
        // Find meeting
        const meeting = await Meeting.findByCode(meetingCode);
        if (!meeting) {
            throw new Error('Meeting not found or inactive');
        }

        // Add participant if not already in
        const isInMeeting = await Participant.isInMeeting(meeting.id, userId);
        if (!isInMeeting) {
            await Participant.add(meeting.id, userId);
        }

        return meeting;
    },

    // Get complete meeting details with participants and chats
    getCompleteMeetingDetails: async (meetingId) => {
        const meeting = await Meeting.findById(meetingId);
        const participants = await Participant.getByMeeting(meetingId);
        const chats = await Chat.getByMeeting(meetingId);

        return { meeting, participants, chats };
    },

    // End meeting and notify participants
    endMeetingAndNotify: async (meetingId, hostId, io) => {
        const meeting = await Meeting.findById(meetingId);
        
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        if (meeting.host_id !== hostId) {
            throw new Error('Only host can end meeting');
        }

        await Meeting.endMeeting(meetingId);
        io.to(`meeting-${meetingId}`).emit('meeting-ended');
        
        return true;
    },

    // Leave meeting
    leaveMeeting: async (meetingId, userId) => {
        await Participant.remove(meetingId, userId);
        return true;
    },

    // Get user's meeting history
    getUserMeetingHistory: async (userId) => {
        return await Meeting.getUserMeetings(userId);
    }
};

module.exports = meetingService;