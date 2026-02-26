import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { joinMeeting } from '../store/slices/meetingSlice';

const JoinMeeting = () => {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const join = async () => {
      const result = await dispatch(joinMeeting(meetingCode));
      if (!result.error) {
        navigate(`/meeting/${result.payload.meeting.id}`);
      } else {
        navigate('/');
      }
    };
    join();
  }, [meetingCode, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
};

export default JoinMeeting;