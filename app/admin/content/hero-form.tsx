"use client";

import { useActionState, useState } from "react";
import { uploadHeroImage, type ContentState } from "@/app/actions/content";
import { shrinkFormImages } from "@/lib/client-image";
import FilePicker from "@/components/file-picker";

const initial: ContentState = {};

export default function HeroForm() {
  const [state, action, pending] = useActionState(uploadHeroImage, initial);
  const [problem, setProblem] = useState("");
  const [preparing, setPreparing] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setPreparing(true);
    try {
      const data = await shrinkFormImages(form, 2200);
      action(data);
      form.reset();
    } finally {
      setPreparing(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <FilePicker
        name="files"
        multiple
        label="Choose pictures for the home page"
        hint="Wide photos, 10 to 15 of them, at least 1600 px across"
        onProblem={setProblem}
      />
      <div className="mt-3">
        <label className="field-label" htmlFor="caption">Caption, optional</label>
        <input id="caption" name="caption" className="field" placeholder="Wedding in Chandigarh" />
      </div>
      <button
        className="btn btn-primary mt-3"
        type="submit"
        disabled={pending || preparing || Boolean(problem)}
      >
        {preparing ? "Getting ready..." : pending ? "Uploading..." : "Add to the home page"}
      </button>
      {state.error ? <p className="mt-2 text-sm text-brand">{state.error}</p> : null}
      {state.ok ? <p className="mt-2 text-sm text-green">{state.ok}</p> : null}
    </form>
  );
}
