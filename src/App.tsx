import { RouterProvider } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { router } from "./routes";
import { Toaster } from "react-hot-toast";

/**
 * Unified notification presentation.
 * Triggers and messages are unchanged; only the visual treatment is defined here.
 */
const App = () => (
  <div>
    <RouterProvider router={router} />
    <Toaster
      position="top-center"
      reverseOrder={false}
      containerClassName="dc-app"
      toastOptions={{
        // Shared shell for every toast, so success and error read as one system.
        className:
          "!rounded-xl !border !px-4 !py-3 !text-sm !font-medium !shadow-dc-lg !max-w-md",
        duration: 4000,
        success: {
          icon: <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-success" />,
          className:
            "!rounded-xl !border !border-success/30 !bg-white !px-4 !py-3 !text-sm !font-medium !text-foreground !shadow-dc-lg !max-w-md",
        },
        error: {
          icon: <XCircle aria-hidden="true" className="size-5 shrink-0 text-destructive" />,
          className:
            "!rounded-xl !border !border-destructive/30 !bg-white !px-4 !py-3 !text-sm !font-medium !text-foreground !shadow-dc-lg !max-w-md",
        },
      }}
    />
  </div>
);

export default App;
