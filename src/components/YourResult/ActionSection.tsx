import React from "react";
import { Home } from "lucide-react";
import { Button } from "../ui/button";

interface ActionSectionProps {
  onReturnToDashboard: () => void;
}

const ActionSection: React.FC<ActionSectionProps> = ({ onReturnToDashboard }) => {
  return (
    <div className="flex justify-center">
      <Button size="lg" onClick={onReturnToDashboard}>
        <Home aria-hidden="true" />
        Return to Dashboard
      </Button>
    </div>
  );
};

export default ActionSection;
