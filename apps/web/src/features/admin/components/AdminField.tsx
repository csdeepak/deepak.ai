import { Input, Textarea } from "@/components/ui/input";

/** Labelled field with optional hint and error — shared by the D-065 editors. */
export function AdminField({
  label,
  name,
  defaultValue,
  error,
  hint,
  type = "text",
  required,
  textarea,
  rows = 3,
  mono,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-small font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-faint">*</span>}
      </label>
      {hint && <p className="mt-1 text-micro text-faint">{hint}</p>}
      {textarea ? (
        <Textarea
          id={name}
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          className={mono ? "mt-2 font-mono text-small" : "mt-2"}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          className="mt-2"
        />
      )}
      {error && <p className="mt-1 text-micro text-danger">{error}</p>}
    </div>
  );
}
