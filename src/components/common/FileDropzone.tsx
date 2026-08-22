import * as React from "react";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { cn } from "../../libs/utils";

export interface FileDropzoneProps {
  // Currently selected file, owned by the caller.
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  // Mirrors the accept attribute the previous uploader used.
  accept?: string;
  // Runs before the file is accepted; return a message to reject it.
  validate?: (file: File) => string | null;
  title?: string;
  hint?: string;
  id?: string;
  className?: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * Single-file drag-and-drop picker.
 * Replaces the previous uploader's presentation only — the caller still validates the file
 * and builds the request payload.
 */
const FileDropzone = ({
  file,
  onFileSelect,
  onRemove,
  accept,
  validate,
  title = "Click or drag file to upload",
  hint,
  id,
  className,
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const reactId = React.useId();
  const inputId = id ?? reactId;

  const accept_ = (candidate: File | undefined) => {
    if (!candidate) return;
    // Rejection messaging is the caller's responsibility, via `validate`.
    if (validate && validate(candidate)) return;
    onFileSelect(candidate);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    accept_(event.dataTransfer.files?.[0]);
  };

  // A selected file replaces the dropzone with a compact summary row.
  if (file) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border bg-card p-3.5",
          className
        )}
      >
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-success/10 text-success">
          <FileSpreadsheet aria-hidden="true" className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
          <span className="dc-caption dc-numeric">{formatSize(file.size)}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "rounded-xl border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-accent" : "border-border bg-muted/30",
        className
      )}
    >
      {/* The label is the click target, so keyboard users reach it via the input. */}
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center gap-2 px-4 py-8 text-center focus-within:outline-none"
      >
        <div className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
          <Upload aria-hidden="true" className="size-5" />
        </div>
        <span className="text-sm font-medium text-foreground">{title}</span>
        {hint && <span className="dc-caption">{hint}</span>}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            accept_(event.target.files?.[0]);
            // Clearing lets the same file be picked again after a removal.
            event.target.value = "";
          }}
        />
      </label>
    </div>
  );
};

export { FileDropzone };
