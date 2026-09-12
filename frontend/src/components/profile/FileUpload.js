import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../common/UI";
export async function readUpload(file, kind = "document") {
  if (!file) return null;
  const max = kind === "image" ? 1 : 2;
  if (file.size > max * 1024 * 1024)
    throw new Error(`Choose a file smaller than ${max} MB for this demo.`);
  if (
    kind === "image" &&
    !["image/png", "image/jpeg", "image/webp"].includes(file.type)
  )
    throw new Error("Choose a PNG, JPEG, or WebP image.");
  if (kind === "document" && !/\.(pdf|doc|docx)$/i.test(file.name))
    throw new Error("Choose a PDF or Word document.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, data: reader.result });
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.readAsDataURL(file);
  });
}
export default function FileUpload({
  label = "Upload CV",
  value,
  onChange,
  kind = "document",
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="upload-zone">
      <Upload size={23} />
      <p>
        {value?.name ||
          value ||
          (kind === "image"
            ? "PNG, JPG or WebP, up to 1 MB"
            : "PDF or Word document, up to 2 MB")}
      </p>
      <Input
        label={busy ? "Reading file…" : label}
        type="file"
        accept={kind === "image" ? ".png,.jpg,.jpeg,.webp" : ".pdf,.doc,.docx"}
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files[0];
          setBusy(true);
          try {
            const result = await readUpload(file, kind);
            if (result) onChange(result);
          } catch (error) {
            toast.error(error.message);
            e.target.value = "";
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
