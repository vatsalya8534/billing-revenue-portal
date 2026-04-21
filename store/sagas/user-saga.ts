import { put, takeLatest } from "redux-saga/effects";
import { USER_LOGIN_REQUEST, USER_LOGOUT_REQUEST } from "../actions/user-actions";
import { clearUser, setUser } from "../reducers/user-reducer";

function* handleUserLogin(action: { payload: any }) {
    yield put(setUser(action.payload));
}

function* handleUserLogout() {
    yield put(clearUser());
}

export function* watchUserAuth(): Generator {
    yield takeLatest(USER_LOGIN_REQUEST as any, handleUserLogin);
    yield takeLatest(USER_LOGOUT_REQUEST as any, handleUserLogout);
}
