import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserInfo } from "../actions/user-actions";

interface UserState {
	user: UserInfo | null;
	isAuthenticated: boolean;
}

const initialState: UserState = {
	user: null,
	isAuthenticated: false,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser(state, action: PayloadAction<UserInfo>) {
			state.user = action.payload;
			state.isAuthenticated = true;
		},
		clearUser(state) {
			state.user = null;
			state.isAuthenticated = false;
		},
	},
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

