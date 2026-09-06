import React from "react";
import { LoadingState as SharedLoadingState } from "../common/LoadingState";

// Full-height wrapper so the result screen does not jump when the content arrives.
const LoadingState: React.FC = () => (
  <div className="dc-app flex min-h-[60vh] items-center justify-center">
    <SharedLoadingState label="Calculating your results..." />
  </div>
);

export default LoadingState;
