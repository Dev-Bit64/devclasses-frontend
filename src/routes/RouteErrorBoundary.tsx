import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ErrorState } from "../components/common/ErrorState";

// True when a lazy route chunk failed to download — almost always a stale client after a deploy.
const isChunkLoadError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    const text = `${error.name} ${error.message}`;
    return /ChunkLoadError|dynamically imported module|Importing a module script failed/i.test(text);
};

// Best-effort human-readable message for the dev-only detail line.
const describeError = (error: unknown): string => {
    if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
    if (error instanceof Error) return error.message;
    return String(error);
};

// Root errorElement for the data router: replaces the blank screen a thrown render/lazy-load
// error would otherwise leave. Recovery-first — reload fixes a stale chunk, the dashboard link
// is a plain anchor so it works even when the router itself is the thing that failed.
const RouteErrorBoundary = () => {
    const error = useRouteError();
    const staleChunk = isChunkLoadError(error);

    return (
        // Full-screen shell mirrors LoadingFallback so a failed route looks like part of the app.
        <div className="dc-app flex min-h-[100dvh] items-center justify-center bg-surface px-4 py-12">
            <div className="flex w-full max-w-md flex-col items-center gap-4">
                <ErrorState
                    title={staleChunk ? "A new version is available" : "Something went wrong"}
                    description={
                        staleChunk
                            ? "The app was updated while this tab was open. Reload to continue."
                            : "This page ran into an unexpected error. Reloading usually fixes it."
                    }
                    // window.location.reload re-fetches the app shell and any missing chunks.
                    onRetry={() => window.location.reload()}
                    retryLabel="Reload page"
                    action={
                        <Button asChild variant="secondary">
                            <a href="/dashboard">Go to dashboard</a>
                        </Button>
                    }
                />

                {/* Error internals are for developers only — never shown to end users in production. */}
                {import.meta.env.DEV && (
                    <pre className="max-h-48 w-full overflow-auto rounded-lg border border-border bg-muted p-3 text-left text-xs text-muted-foreground">
                        {describeError(error)}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default RouteErrorBoundary;
