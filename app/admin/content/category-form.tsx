"use client";

import { useActionState, useState } from "react";
import { uploadCategoryImage, type ContentState } from "@/app/actions/content";
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


export default function CategoryImageForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(uploadCategoryImage, initial);
  const [problem, setProblem] = useState("");
  const { onSubmit, preparing } = useShrinkSubmit(action, 2200);

  return (
    <form onSubmit={onSubmit} className="mt-3">
      <input suppressHydrationWarning type="hidden" name="slug" value={slug} />
      <FilePicker
        name="file"
        label="Choose a picture"
        hint="Wide photo, at least 1200 px across"
        onProblem={setProblem}
      />
      <button suppressHydrationWarning className="btn btn-ghost mt-2 w-full px-3 py-1.5 text-xs" type="submit" disabled={pending || preparing || Boolean(problem)}>
        {preparing ? "Getting ready..." : pending ? "Uploading..." : "Upload"}
      </button>
      {state.error ? <p className="mt-1 text-xs text-brand">{state.error}</p> : null}
      {state.ok ? <p className="mt-1 text-xs text-green">{state.ok}</p> : null}
    </form>
  );
}
