/* eslint-disable @typescript-eslint/no-explicit-any */
export const phoneNumberFormatter = (phoneNumber: any, dialCode: any) => {
    // Remove non-digit characters from the input phone number
    const inputPhoneNumber = phoneNumber.replace(/\D/g, "");
    // Extract the dial code from the start of the phone number
    const extractedDialCode = inputPhoneNumber.slice(0, dialCode.length);
  
    // Remove the dial code from the phone number
    const cleanedPhoneNumber = inputPhoneNumber.slice(dialCode.length);
    let formattedPhoneNumber = "";
    // Format the remaining digits with hyphens
    for (let i = 0; i < cleanedPhoneNumber.length; i++) {
      if (i === 3 || i === 6) {
        formattedPhoneNumber += `-${cleanedPhoneNumber[i]}`;
      } else {
        formattedPhoneNumber += cleanedPhoneNumber[i];
      }
    }
    // Add the dial code back with a "+" symbol
    formattedPhoneNumber = "+" + extractedDialCode + " " + formattedPhoneNumber;
    return { formattedPhoneNumber, cleanedPhoneNumber };
  };
  
  export const phoneNumberFormatDisplay = (phoneNumber: any) => {
    // Remove non-digit characters from the input phone number
    const inputPhoneNumber = phoneNumber?.replace(/\D/g, "");
    let formattedPhoneNumber = "";
    // Check if there are digits in the input phone number
    if (inputPhoneNumber.length > 0) {
      // Format the area code (first 3 digits)
      formattedPhoneNumber = `(${inputPhoneNumber.slice(0, 3)}`;
      // Add a space and format the next 3 digits
      if (inputPhoneNumber.length >= 4) {
        formattedPhoneNumber += `) ${inputPhoneNumber.slice(3, 6)}`;
      }
      // Add a hyphen and format the last 4 digits
      if (inputPhoneNumber.length >= 7) {
        formattedPhoneNumber += `-${inputPhoneNumber.slice(6, 10)}`;
      }
    }
    return formattedPhoneNumber;
  };
  