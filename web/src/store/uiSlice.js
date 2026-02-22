import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { unreadMessageCount: 0 },
  reducers: {
    setUnreadMessageCount: (state, action) => {
      state.unreadMessageCount = action.payload;
    },
  },
});

export const { setUnreadMessageCount } = uiSlice.actions;
export default uiSlice.reducer;
