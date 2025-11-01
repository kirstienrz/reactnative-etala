import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserProfile, updateUserProfile } from "../api/user";

// Async thunks
export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      return await getUserProfile(userId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// export const saveProfile = createAsyncThunk(
//   "user/saveProfile",
//   async ({ userId, payload }) => {
//     return await updateUserProfile(userId, payload);
//   }
// );
export const saveProfile = createAsyncThunk("user/saveProfile", async (payload) => {
  const res = await updateUserProfile(payload); // payload can contain only changed fields
  return res; 
});


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
        state.error = action.error.message;
      })
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
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
