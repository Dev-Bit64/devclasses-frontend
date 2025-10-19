import toast from "react-hot-toast";

export const toastText = (message: string, type: string) => {
  // Common style configuration for both success and error toasts
  const commonStyle = {
    style: {
      fontSize: "16px",
    },
  };

  switch (type) {
    case "success":
      toast.success(message, commonStyle);
      break;

    case "error":
      toast.error(message, commonStyle);
      break;
  }
};