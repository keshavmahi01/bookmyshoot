"use client";

import { useActionState, useState } from "react";
import { uploadProfilePhotoAsAdmin, type ContentState } from "@/app/actions/content";
import { shrinkFormImages } from "@/lib/client-image";
import FilePicker from "@/components/file-picker";

const initial: ContentState = {};

function useShrinkSubmit(action: (data: FormData) => void, maxEdge = 2000) {
  const [preparing, setPreparing] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setPreparing(true);
    try {
      const data = await shrinkFormImages(form, maxEdge);
      action(data);
      form.reset();
    } finally {
      setPreparing(false);
    }
  };

  return { onSubmit, preparing };
}


export default function ProfilePhotoForm({
  photographerId,
  kind,
  label,
}: {
  photographerId: string;
  kind: "avatar" | "cover";
  label: string;
}) {
  const [state, action, pending] = useActionState(uploadProfilePhotoAsAdmin, initial);
  const [problem, setProblem] = useState("");
  const { onSubmit, preparing } = useShrinkSubmit(action, kind === "avatar" ? 1200 : 2200);

  return (
    <form onSubmit={onSubmit} className="flex-1">
      <input suppressHydrationWarning type="hidden" name="photographerId" value={photographerId} />
      <input suppressHydrationWarning type="hidden" name="kind" value={kind} />
      <FilePicker name="file" label={label} size="small" onProblem={setProblem} />
      <button suppressHydrationWarning className="btn btn-ghost mt-1.5 w-full px-2 py-1 text-[11px]" type="submit" disabled={pending || preparing || Boolean(problem)}>
        {preparing ? "Getting ready..." : pending ? "Uploading..." : "Upload"}
      </button>
      {state.error ? <p className="mt-1 text-[11px] text-brand">{state.error}</p> : null}
      {state.ok ? <p className="mt-1 text-[11px] text-green">{state.ok}</p> : null}
    </form>
  );
}
