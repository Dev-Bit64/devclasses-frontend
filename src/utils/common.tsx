export const capitalizeFirstLetter = (inputString: string) => {
    // Check if the inputString is a string and not empty
    if (typeof inputString !== 'string' || inputString.length === 0) {
        throw new Error('Input must be a non-empty string');
    }
    // Convert the first character to uppercase
    const firstCharUpperCase = inputString.charAt(0).toUpperCase();
    // Combine the first uppercase character with the rest of the string
    return firstCharUpperCase + inputString.slice(1);
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${month}-${day}-${year}`;
}
