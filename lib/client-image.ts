/**
 * Shrinks a photo in the browser before it is sent.
 *
 * A photo straight off a phone is 4 to 12 MB. Sending that to a server action
 * is slow on Indian mobile data and runs into the request size limit, which
 * shows up as a plain "Failed to fetch". We redraw it smaller first, so a
 * normal photo goes up as a few hundred KB. The server resizes again, so the
 * stored file is the same either way.
 */

const SKIP_BELOW = 400 * 1024;

export async function shrinkImage(file: File, maxEdge = 2000, quality = 0.84): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size < SKIP_BELOW) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // Old browser, or a file the canvas cannot read. Send the original.
    return file;
  }
}

/** Builds the form data with every picked photo already shrunk. */
export async function shrinkFormImages(form: HTMLFormElement, maxEdge = 2000) {
  const data = new FormData(form);
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"]'));

  for (const input of inputs) {
    if (input.name) data.delete(input.name);
  }
  for (const input of inputs) {
    if (!input.name || !input.files) continue;
    for (const file of Array.from(input.files)) {
      if (file.size === 0) continue;
      data.append(input.name, await shrinkImage(file, maxEdge));
    }
  }
  return data;
}
