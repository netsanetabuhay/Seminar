import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createMeeting = createAsyncThunk(
  'meeting/create',
  async (title, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/meetings/create`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const joinMeeting = createAsyncThunk(
  'meeting/join',
  async (meetingCode, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/meetings/join`,
        { meetingCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMeetingDetails = createAsyncThunk(
  'meeting/getDetails',
  async (meetingId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const meetingSlice = createSlice({
  name: 'meeting',
  initialState: {
    currentMeeting: null,
    meetings: [],
    participants: [],
    chats: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMeeting: (state) => {
      state.currentMeeting = null;
      state.participants = [];
      state.chats = [];
    },
    addChat: (state, action) => {
      state.chats.push(action.payload);
    },
    addParticipant: (state, action) => {
      state.participants.push(action.payload);
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p.userId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMeeting = action.payload.meeting;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create meeting';
      })
      .addCase(joinMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMeeting = action.payload.meeting;
        state.participants = action.payload.participants || [];
        state.chats = action.payload.chats || [];
      })
      .addCase(joinMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to join meeting';
      })
      .addCase(getMeetingDetails.fulfilled, (state, action) => {
        state.currentMeeting = action.payload.meeting;
        state.participants = action.payload.participants || [];
        state.chats = action.payload.chats || [];
      });
  },
});

export const { clearMeeting, addChat, addParticipant, removeParticipant } = meetingSlice.actions;
export default meetingSlice.reducer;