import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import jwtDecode from "jwt-decode";
import { getItem, saveItem, deleteItem } from "../utils/storage";
import { getUserProfile, updateUserProfile } from "../api/user"; // your API wrapper

// -------------------------------
// Restore token from SecureStore
// -------------------------------
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async () => {
    const token = await getItem("token");
    const role = await getItem("role");

    if (!token || !role) return { token: null, role: null, isLoggedIn: false };

    try {
      const decoded = jwtDecode(token);
      const isValid = decoded.exp * 1000 > Date.now();

      if (!isValid) {
        await deleteItem("token");
        await deleteItem("role");
        return { token: null, role: null, isLoggedIn: false };
      }

      return { token, role, isLoggedIn: true };
    } catch (err) {
      await deleteItem("token");
      await deleteItem("role");
      return { token: null, role: null, isLoggedIn: false };
    }
  }
);

// -------------------------------
// Fetch profile from backend
// -------------------------------
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.token;
      if (!token) throw new Error("No token");

      // assume your backend returns profile for current user
      const profile = await getUserProfile("me");
      return profile;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch profile");
    }
  }
);

// -------------------------------
// Update profile
// -------------------------------
export const saveProfile = createAsyncThunk(
  "auth/saveProfile",
  async (payload, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.token;
      if (!token) throw new Error("No token");

      const updated = await updateUserProfile("me", payload);
      return updated;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to update profile");
    }
  }
);

// -------------------------------
// Initial State
// -------------------------------
const initialState = {
  token: null,
  role: null,
  isLoggedIn: false,
  profile: null,
  loading: true,
  updating: false,
  error: null,
};

// -------------------------------
// Slice
// -------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, role, profile } = action.payload;
      state.token = token;
      state.role = role;
      state.isLoggedIn = true;
      state.profile = profile || null;

      saveItem("token", token);
      saveItem("role", role);
    },

    logout: (state) => {
      state.token = null;
      state.role = null;
      state.isLoggedIn = false;
      state.profile = null;

      deleteItem("token");
      deleteItem("role");
    },

    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },

  extraReducers: (builder) => {
    // restoreSession
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        const { token, role, isLoggedIn } = action.payload;
        state.token = token;
        state.role = role;
        state.isLoggedIn = isLoggedIn;
        state.loading = false;
      });

    // fetchProfile
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
        state.error = action.payload;
        state.profile = null;
      });

    // saveProfile
    builder
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
        state.error = action.payload;
      });
  },
});

export const { loginSuccess, logout, setProfile } = authSlice.actions;
export default authSlice.reducer;
