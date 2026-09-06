import { configureStore } from "@reduxjs/toolkit";
import auth from "./slice/authSlice";
import userSlice from "./slice/userSlice";
import questionsSlice from "./slice/questionSlice";
import dashboardSlice from "./slice/dashboardSlice";
import subjectSlice from "./slice/subjectSlice";
import examSlice from "./slice/examSlice";
import collegeCatalogSlice from "./slice/collegeCatalogSlice";
import collegeContentSlice from "./slice/collegeContentSlice";
import collegePracticeSlice from "./slice/collegePracticeSlice";
import collegePaymentSlice from "./slice/collegePaymentSlice";
import collegeDeviceSlice from "./slice/collegeDeviceSlice";
import collegeAnalyticsSlice from "./slice/collegeAnalyticsSlice";
import collegeStudentSlice from "./slice/collegeStudentSlice";

const store = configureStore({
    reducer: {
        auth: auth.reducer,
        user: userSlice.reducer,
        questions: questionsSlice.reducer,
        dashboard: dashboardSlice.reducer,
        subject: subjectSlice.reducer,
        exam: examSlice.reducer,
        collegeCatalog: collegeCatalogSlice.reducer,
        collegeContent: collegeContentSlice.reducer,
        collegePractice: collegePracticeSlice.reducer,
        collegePayment: collegePaymentSlice.reducer,
        collegeDevice: collegeDeviceSlice.reducer,
        collegeAnalytics: collegeAnalyticsSlice.reducer,
        collegeStudent: collegeStudentSlice.reducer,
    }
});

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;