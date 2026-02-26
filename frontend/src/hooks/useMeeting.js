import { useSelector, useDispatch } from 'react-redux';
import { createMeeting, joinMeeting, endMeeting, leaveMeeting } from '../store/slices/meetingSlice';

export const useMeeting = () => {
  const dispatch = useDispatch();
  const { currentMeeting, participants, chats, loading } = useSelector((state) => state.meeting);

  const handleCreateMeeting = async (title) => {
    return await dispatch(createMeeting(title));
  };

  const handleJoinMeeting = async (meetingCode) => {
    return await dispatch(joinMeeting(meetingCode));
  };

  const handleEndMeeting = async (meetingId) => {
    return await dispatch(endMeeting(meetingId));
  };

  const handleLeaveMeeting = async (meetingId) => {
    return await dispatch(leaveMeeting(meetingId));
  };

  return {
    currentMeeting,
    participants,
    chats,
    loading,
    createMeeting: handleCreateMeeting,
    joinMeeting: handleJoinMeeting,
    endMeeting: handleEndMeeting,
    leaveMeeting: handleLeaveMeeting,
  };
};