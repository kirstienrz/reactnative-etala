import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserProfile, updateUserProfile } from "../api/user";
import { getItem } from "../utils/storage";

// Fetch profile using stored token/userId
export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const userId = await getItem("userId"); // store userId on login
      return await getUserProfile(userId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Save profile
export const saveProfile = createAsyncThunk(
  "user/saveProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const userId = await getItem("userId"); // get current userId
      return await updateUserProfile(userId, payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    loading: false,
    error: null,
    updating: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // saveProfile
      .addCase(saveProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default userSlice.reducer;
