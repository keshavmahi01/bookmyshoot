"use client";

import { useActionState, useState } from "react";
import { uploadAvatar, uploadCover, uploadWork, type PhotoState } from "@/app/actions/photos";
import { shrinkFormImages } from "@/lib/client-image";
import FilePicker from "@/components/file-picker";

const initial: PhotoState = {};

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


function Message({ state }: { state: PhotoState }) {
  if (state.error) return <p className="mt-2 text-sm text-brand">{state.error}</p>;
  if (state.ok) return <p className="mt-2 text-sm text-green">{state.ok}</p>;
  return null;
}

export function AvatarForm() {
  const [state, action, pending] = useActionState(uploadAvatar, initial);
  const [problem, setProblem] = useState("");
  const { onSubmit, preparing } = useShrinkSubmit(action, 1200);
  return (
    <form onSubmit={onSubmit}>
      <FilePicker name="file" label="Choose your profile photo" onProblem={setProblem} />
      <button suppressHydrationWarning className="btn btn-primary mt-3 w-full" type="submit" disabled={pending || preparing || Boolean(problem)}>
        {preparing ? "Getting ready..." : pending ? "Uploading..." : "Upload profile photo"}
      </button>
      <Message state={state} />
    </form>
  );
}

export function CoverForm() {
  const [state, action, pending] = useActionState(uploadCover, initial);
  const [problem, setProblem] = useState("");
  const { onSubmit, preparing } = useShrinkSubmit(action, 2200);
  return (
    <form onSubmit={onSubmit}>
      <FilePicker name="file" label="Choose a cover photo" onProblem={setProblem} />
      <button suppressHydrationWarning className="btn btn-primary mt-3 w-full" type="submit" disabled={pending || preparing || Boolean(problem)}>
        {preparing ? "Getting ready..." : pending ? "Uploading..." : "Upload cover photo"}
      </button>
      <Message state={state} />
    </form>
  );
}

export function WorkForm({ categories }: { categories: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(uploadWork, initial);
  const [problem, setProblem] = useState("");
  const { onSubmit, preparing } = useShrinkSubmit(action, 2000);
  const year = new Date().getFullYear();
  return (
    <form onSubmit={onSubmit}>
      <FilePicker name="files" multiple label="Choose photos of your work" onProblem={setProblem} />
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
        {preparing ? "Getting ready..." : pending ? "Uploading..." : "Add to my work"}
      </button>
      <Message state={state} />
    </form>
  );
}
