import { useEffect, useState } from "react";
import "./index.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Button } from "antd"; // Import the Button component from Ant Design

const PageNotFound = () => {

    const navigate = useNavigate();
    const [secondsRemaining, setSecondsRemaining] = useState(10);

    useEffect(() => {
        // Check if an access token is stored in cookies
        const accessToken = Cookies.get("accessToken");

        // If no access token is found, redirect to the login page
        if (!accessToken) {
            navigate("/");
            return;
        }

        // Remove the access token from cookies
        Cookies.remove("accessToken");

        // Create an interval to count down the seconds remaining
        const intervalId = setInterval(() => {
            setSecondsRemaining((prevSeconds) => {
                // When there is only 1 second left, clear the interval and redirect to login
                if (prevSeconds === 1) {
                    clearInterval(intervalId);
                    navigate("/");
                }
                // Decrement the remaining seconds
                return prevSeconds - 1;
            });
        }, 1000); // The interval runs every 1000ms (1 second)

        // Cleanup function to clear the interval when the component unmounts
        return () => {
            clearInterval(intervalId);
        };
    }, [navigate]);

    // Use the Button component from Ant Design to provide a UI for navigation
    return (
        <div id="notfound">
            <div className="notfound">
                <div className="notfound-error">
                    <h1>404</h1>
                    <h2>Page Not Found</h2>
                    {/* <h3>Your session has been overridden!</h3> */}
                </div>

                <Button type="primary" className="returnLogin" onClick={() => navigate("/")}>
                    Back to login
                </Button>

                <p>
                    You will be automatically logged out in {secondsRemaining}{" "}
                    {secondsRemaining === 1 ? "second" : "seconds"}
                </p>
            </div>
        </div>
    );
};

export default PageNotFound;
