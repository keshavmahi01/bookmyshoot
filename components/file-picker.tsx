"use client";

import { useState } from "react";

export const MAX_MB = 5;

/**
 * One file picker used everywhere photos are uploaded. It checks the size the
 * moment a file is picked, so the person sees a plain message instead of a
 * failed upload later.
 */
export default function FilePicker({
  name,
  label,
  hint,
  multiple = false,
  size = "normal",
  onProblem,
}: {
  name: string;
  label: string;
  hint?: string;
  multiple?: boolean;
  size?: "normal" | "small";
  onProblem?: (message: string) => void;
}) {
  const [picked, setPicked] = useState("");
  const [problem, setProblem] = useState("");

  const handle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const tooBig = files.find((f) => f.size > MAX_MB * 1024 * 1024);

    if (tooBig) {
      const mb = (tooBig.size / (1024 * 1024)).toFixed(1);
      const message = `${tooBig.name} is ${mb} MB. Please upload a photo under ${MAX_MB} MB.`;
      event.target.value = "";
      setPicked("");
      setProblem(message);
      onProblem?.(message);
      return;
    }

    setProblem("");
    onProblem?.("");
    setPicked(
      files.length === 0
        ? ""
        : files.length === 1
          ? files[0].name
          : `${files.length} photos picked`,
    );
  };

  const small = size === "small";

  return (
    <div>
      <label
        className={`block cursor-pointer rounded-lg border border-dashed bg-sand text-center transition hover:border-brand hover:bg-brand-soft ${
          problem ? "border-brand" : "border-line"
        } ${small ? "px-2 py-2" : "px-4 py-6"}`}
      >
        <input
          type="file"
          name={name}
          multiple={multiple}
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={handle}
        />
        <span className={`block font-semibold text-ink ${small ? "text-[11px]" : "text-sm"}`}>
          {label}
        </span>
        <span className={`mt-0.5 block truncate text-ink-faint ${small ? "text-[10px]" : "text-xs"}`}>
          {picked || hint || `JPG, PNG or WEBP, up to ${MAX_MB} MB each`}
        </span>
      </label>

      {problem ? (
        <p
          role="alert"
          className={`mt-2 rounded-lg border border-brand/40 bg-brand-soft px-3 py-2 text-brand-deep ${
            small ? "text-[11px]" : "text-sm"
          }`}
        >
          {problem} Shrink it on your phone, or pick a smaller one.
        </p>
      ) : null}
    </div>
  );
}
