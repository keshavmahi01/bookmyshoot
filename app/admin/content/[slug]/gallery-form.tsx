"use client";

import { useActionState, useState } from "react";
import { uploadGalleryAsAdmin, type ContentState } from "@/app/actions/content";
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


export default function GalleryForm({
  photographerId,
  categories,
}: {
  photographerId: string;
  categories: { slug: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(uploadGalleryAsAdmin, initial);
  const [problem, setProblem] = useState("");
  const { onSubmit, preparing } = useShrinkSubmit(action, 2000);
  const year = new Date().getFullYear();

  return (
    <form onSubmit={onSubmit}>
      <input suppressHydrationWarning type="hidden" name="photographerId" value={photographerId} />
      <FilePicker
        name="files"
        multiple
        label="Choose photos for this gallery"
        hint="Up to 12 at a time"
        onProblem={setProblem}
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="title">Shoot name</label>
          <input suppressHydrationWarning id="title" name="title" className="field" placeholder="Simran and Arjun, Mohali" />
        </div>
        <div>
          <label className="field-label" htmlFor="categorySlug">Shoot type</label>
          <select suppressHydrationWarning id="categorySlug" name="categorySlug" className="field">
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="year">Year</label>
          <input suppressHydrationWarning id="year" name="year" inputMode="numeric" className="field" defaultValue={year} />
        </div>
      </div>

      <button suppressHydrationWarning className="btn btn-primary mt-3" type="submit" disabled={pending || preparing || Boolean(problem)}>
        {preparing ? "Getting ready..." : pending ? "Uploading..." : "Add photos"}
      </button>
      {state.error ? <p className="mt-2 text-sm text-brand">{state.error}</p> : null}
      {state.ok ? <p className="mt-2 text-sm text-green">{state.ok}</p> : null}
    </form>
  );
}
