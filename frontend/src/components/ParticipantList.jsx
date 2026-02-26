import React from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiUser } from 'react-icons/fi';

const ParticipantList = ({ participants, hostId, currentUser }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-base-200">
        <h3 className="font-bold">Participants ({participants.length + 1})</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Current user */}
        <div className="flex items-center justify-between py-2 px-3 bg-base-200 rounded-lg mb-2">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-8">
                <span>{currentUser?.username?.[0]?.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <p className="font-semibold">{currentUser?.username} (You)</p>
              <p className="text-xs opacity-70">
                {currentUser?.id === hostId ? 'Host' : 'Participant'}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="btn btn-xs btn-ghost btn-circle">
              <FiMic className="text-lg" />
            </button>
            <button className="btn btn-xs btn-ghost btn-circle">
              <FiVideo className="text-lg" />
            </button>
          </div>
        </div>

        {/* Other participants */}
        {participants.map((participant) => (
          <div key={participant.userId} className="flex items-center justify-between py-2 px-3 hover:bg-base-200 rounded-lg mb-2">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8">
                  <span>{participant.username?.[0]?.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <p className="font-semibold">{participant.username}</p>
                <p className="text-xs opacity-70">
                  {participant.userId === hostId ? 'Host' : 'Participant'}
                </p>
              </div>
            </div>
            {currentUser?.id === hostId && participant.userId !== hostId && (
              <button className="btn btn-xs btn-error btn-outline">
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;