/**
 * Uploads a file to a presigned storage URL.
 *
 * Deliberately uses XMLHttpRequest rather than the shared axios instance: that instance
 * attaches the portal's Authorization header and AES-encrypts every non-GET body, both of
 * which would break a presigned PUT — and it reports no upload progress, which a video file
 * needs. The signature already carries the authorisation, so no header of ours belongs here.
 */
export const uploadToSignedUrl = (
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void
): Promise<void> =>
    new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("PUT", uploadUrl, true);
        // Must match the content type the URL was signed for, or storage rejects the PUT.
        request.setRequestHeader("Content-Type", file.type);

        request.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload failed (${request.status}). Please try again.`));
            }
        };

        request.onerror = () => reject(new Error("Upload failed. Please check your connection and try again."));
        request.onabort = () => reject(new Error("Upload cancelled."));

        request.send(file);
    });

/** Reads a media file's duration in whole seconds, so the admin does not have to type it. */
export const readMediaDuration = (file: File): Promise<number | null> =>
    new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const element = document.createElement("video");

        const cleanUp = () => URL.revokeObjectURL(objectUrl);

        element.preload = "metadata";
        element.onloadedmetadata = () => {
            cleanUp();
            // Some containers report Infinity until the file is seeked; not worth chasing —
            // the admin can always type the duration in.
            resolve(Number.isFinite(element.duration) ? Math.round(element.duration) : null);
        };
        element.onerror = () => {
            cleanUp();
            resolve(null);
        };

        element.src = objectUrl;
    });

/** Whole minutes and seconds, e.g. 8:05. Integer arithmetic only. */
export const formatDuration = (totalSeconds?: number | null) => {
    if (totalSeconds === null || totalSeconds === undefined) return "—";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
