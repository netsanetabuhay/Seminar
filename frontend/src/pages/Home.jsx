import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createMeeting, joinMeeting } from '../store/slices/meetingSlice';
import { logout } from '../store/slices/authSlice';
import { FiVideo, FiLogOut, FiUsers, FiCalendar } from 'react-icons/fi';

const Home = () => {
  const [meetingCode, setMeetingCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.meeting);

  const handleCreateMeeting = async () => {
    const result = await dispatch(createMeeting('My Meeting'));
    if (!result.error) {
      navigate(`/meeting/${result.payload.meeting.id}`);
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    const result = await dispatch(joinMeeting(meetingCode));
    if (!result.error) {
      navigate(`/meeting/${result.payload.meeting.id}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Seminar Meet</a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-lg">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><a className="justify-between">Profile</a></li>
              <li><a onClick={handleLogout}><FiLogOut /> Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="hero min-h-[calc(100vh-64px)] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-4">Welcome, {user?.username}!</h1>
            <p className="text-xl mb-8">Start or join a meeting to connect with others</p>
            
            <div className="flex flex-col gap-4">
              <button
                onClick={handleCreateMeeting}
                className={`btn btn-primary btn-lg ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                <FiVideo className="mr-2" />
                Create New Meeting
              </button>

              <div className="divider">OR</div>

              {!showJoin ? (
                <button
                  onClick={() => setShowJoin(true)}
                  className="btn btn-outline btn-lg"
                >
                  Join a Meeting
                </button>
              ) : (
                <form onSubmit={handleJoinMeeting} className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Enter meeting code"
                    className="input input-bordered w-full"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
                      disabled={loading}
                    >
                      Join
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowJoin(false)}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="stats shadow mt-8 w-full">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <FiUsers className="text-2xl" />
                </div>
                <div className="stat-title">Total Meetings</div>
                <div className="stat-value text-primary">0</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <FiCalendar className="text-2xl" />
                </div>
                <div className="stat-title">This Month</div>
                <div className="stat-value text-secondary">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;