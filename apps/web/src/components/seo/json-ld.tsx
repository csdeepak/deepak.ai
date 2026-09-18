/**
 * JsonLd — renders a schema.org graph into the document.
 *
 * `dangerouslySetInnerHTML` is the documented way to emit JSON-LD in React
 * (a plain child would be HTML-escaped and the script would not parse). The
 * input is never visitor-supplied — it is built server-side in
 * `lib/structured-data.ts` from our own content — and `<` is escaped anyway so
 * a stray `</script>` inside a title or description can't break out of the
 * tag and inject markup.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
