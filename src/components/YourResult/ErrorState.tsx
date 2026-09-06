import React from "react";
import { Home } from "lucide-react";
import { ErrorState as SharedErrorState } from "../common/ErrorState";
import { Button } from "../ui/button";

interface ErrorStateProps {
  onReturnToDashboard: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onReturnToDashboard }) => {
  return (
    <div className="dc-app mx-auto w-full max-w-2xl px-4 py-12">
      <SharedErrorState
        title="Failed to Load Results"
        description="Sorry, there was an error loading your quiz results."
        action={
          <Button onClick={onReturnToDashboard}>
            <Home aria-hidden="true" />
            Return to Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default ErrorState;
