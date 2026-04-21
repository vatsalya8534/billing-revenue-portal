import { all, fork } from "redux-saga/effects";
import { watchUserAuth } from "./sagas/user-saga";

export default function* rootSaga() {
	yield all([fork(watchUserAuth)]);
}

