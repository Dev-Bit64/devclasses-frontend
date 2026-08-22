import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "../../components/ui/button";

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

    return (
        <div className="dc-public flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
            <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
                    <Compass aria-hidden="true" className="size-7" />
                </div>

                <div className="flex flex-col gap-2">
                    <p className="dc-numeric text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
                        404
                    </p>
                    <h1 className="dc-h2">Page Not Found</h1>
                </div>

                <Button size="lg" onClick={() => navigate("/")}>
                    <ArrowLeft aria-hidden="true" />
                    Back to login
                </Button>

                {/* The countdown is announced politely rather than on every tick. */}
                <p className="dc-small" role="status" aria-live="polite">
                    You will be automatically logged out in {secondsRemaining}{" "}
                    {secondsRemaining === 1 ? "second" : "seconds"}
                </p>
            </div>
        </div>
    );
};

export default PageNotFound;
