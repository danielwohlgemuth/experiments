import { createSlice, configureStore } from '@reduxjs/toolkit';


const storeSlice = createSlice({
  name: 'store',
  initialState: {
    idToken: '',
    currentUser: '',
  },
  reducers: {
    setIdToken: (state, action) => {
      state.idToken = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

const { setIdToken, setCurrentUser } = storeSlice.actions;

const store = configureStore({
  reducer: storeSlice.reducer
});

export {
  store,
  setIdToken,
  setCurrentUser,
};