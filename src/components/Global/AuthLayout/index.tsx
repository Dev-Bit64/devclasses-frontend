// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../../../redux/store";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../utils/common";
import { useEffect } from "react";

export const AuthLayout = () => {
    // const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // const path = window.location.pathname;

    // // To change the title.
    const { pathname } = useLocation();
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const check = window.location.pathname.split("/").reverse();
        const url = check.filter(
            (item: any) =>
                item !== "localhost:5173" && item !== "" && item !== "http:"
        );
        if (url.length !== 0) {
            if (url.length < 3) {
                if (url.length < 2) {
                    document.title = `${capitalizeFirstLetter(url[0]) + " | " + "Dev Classes"
                        }`;
                } else {
                    document.title = `${capitalizeFirstLetter(url[0]) +
                        " | " +
                        capitalizeFirstLetter(url[1]) +
                        " | " +
                        "Dev Classes"
                        }`;
                }
            } else {
                document.title = `${capitalizeFirstLetter(url[1]) +
                    " | " +
                    capitalizeFirstLetter(url[0]) +
                    " | " +
                    "Dev Classes"
                    }`;
            }
        } else {
            document.title = `Dashboard | Dev Classes`;
        }
        if (!token) {
            // Redirect to landing page if user is not logged in and attempts protected routes
            if (window.location.pathname !== "/") {
                navigate("/");
            }
        }
    }, [pathname]);

    // const path = window.location.pathname;
    // useEffect(() => {
    //     const token = Cookies.get("accessToken");
    //     if (token) {
    //         dispatch(fetchProfileAction())
    //             .unwrap()
    //             .then((_:any) => {
    //                 // dispatch(getCompanies(res));
    //             })
    //             .catch((error: any) => {
    //                 if (error?.response?.data?.statusCode === 401) {
    //                     navigate("/access-denied");
    //                 } else if (
    //                     !(path === "/forgot-password" || path === "/reset-password")
    //                 ) {
    //                     navigate("/login"); //For Verify Email
    //                 }
    //             });

    //         if (path === "/login") {
    //             navigate("/");
    //         }
    //     } else {
    //         if (!(path === "/forgot-password" || path === "/reset-password")) {
    //             navigate("/login"); //For Verify Email
    //         }
    //     }
    // }, []);

    return <Outlet />;
};
