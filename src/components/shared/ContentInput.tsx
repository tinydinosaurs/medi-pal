"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  detectFromFile,
  detectFromText,
  isSupported,
  type DetectedContent,
} from "@/lib/content/detector";

interface ContentInputProps {
  /** File extensions to accept (e.g., [".ics", ".txt"]) */
  accept?: string[];
  /** MIME types to accept (mapped from extensions) */
  acceptMime?: Record<string, string[]>;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Called when content is detected and ready for processing */
  onContent: (detected: DetectedContent) => void;
  /** Called when there's an error */
  onError?: (message: string) => void;
  /** Whether processing is in progress (disables input) */
  isProcessing?: boolean;
  /** Label for the process button */
  processLabel?: string;
}

// Default MIME type mapping
const DEFAULT_ACCEPT_MIME: Record<string, string[]> = {
  "text/calendar": [".ics"],
  "text/plain": [".txt"],
};

export function ContentInput({
  accept = [".ics", ".txt"],
  acceptMime = DEFAULT_ACCEPT_MIME,
  placeholder = "Paste content here or drag & drop a file...",
  onContent,
  onError,
  isProcessing = false,
  processLabel = "Process",
}: ContentInputProps) {
  const [text, setText] = useState("");

  // Handle file selection (from drop or click)
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const detected = await detectFromFile(file);

        if (!isSupported(detected.type)) {
          onError?.(`File type "${detected.type}" is not supported yet.`);
          return;
        }

        // For ICS files, process immediately (deterministic parsing)
        // For text files, put content in textarea for review
        if (detected.type === "ics") {
          onContent(detected);
        } else {
          setText(detected.content);
        }
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Failed to read file");
      }
    },
    [onContent, onError],
  );

  // Setup react-dropzone
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptMime,
    multiple: false,
    noClick: true, // We'll handle click via button
    noKeyboard: false,
    disabled: isProcessing,
  });

  // Handle process button click
  const handleProcess = useCallback(() => {
    if (!text.trim()) return;
    const detected = detectFromText(text);
    onContent(detected);
  }, [text, onContent]);

  // Handle clear
  const handleClear = useCallback(() => {
    setText("");
  }, []);

  return (
    <Card
      {...getRootProps()}
      className={`border-2 transition-colors ${
        isDragActive ? "border-emerald-400 bg-emerald-50" : "border-slate-200"
      }`}
    >
      <CardContent className="p-4">
        {/* Hidden file input managed by dropzone */}
        <input {...getInputProps()} />

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={isProcessing}
          className="min-h-[150px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:bg-slate-50 disabled:text-slate-400"
        />

        {/* Drag overlay hint */}
        {isDragActive && (
          <div className="mt-2 text-center text-sm font-medium text-emerald-600">
            Drop file here...
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Upload button (triggers dropzone) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={open}
            disabled={isProcessing}
            className="rounded-full"
          >
            📎 Upload File
          </Button>

          {/* Process button */}
          <Button
            type="button"
            size="sm"
            onClick={handleProcess}
            disabled={isProcessing || !text.trim()}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isProcessing ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              processLabel
            )}
          </Button>

          {/* Clear button */}
          {text && !isProcessing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="rounded-full text-slate-500"
            >
              Clear
            </Button>
          )}

          {/* Accepted formats hint */}
          <span className="ml-auto text-xs text-slate-400">
            Accepts: {accept.join(", ")} or paste text
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
