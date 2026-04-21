import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./root-saga";
import userReducer from "./reducers/user-reducer";
import cartReducer from "./reducers/cart-reducer";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
	reducer: {
		user: userReducer,
		cart: cartReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			thunk: false,
		}).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

