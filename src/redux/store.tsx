import { configureStore } from "@reduxjs/toolkit";
import auth from "./slice/authSlice";
import userSlice from "./slice/userSlice";
import questionsSlice from "./slice/questionSlice";
import dashboardSlice from "./slice/dashboardSlice";
import subjectSlice from "./slice/subjectSlice";
import examSlice from "./slice/examSlice";

// import profileSlice from "./slice/profileSlice";
// import OrganisationSlice from "./slice/organisationSlice";

const store = configureStore({
    reducer: {
        auth: auth.reducer,
        user: userSlice.reducer,
        questions: questionsSlice.reducer,
        dashboard: dashboardSlice.reducer,
        subject: subjectSlice.reducer,
        exam: examSlice.reducer,
    }
});

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;