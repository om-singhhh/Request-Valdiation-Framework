/**
 * Compact metadata grid (glyph/year/name pattern from reference → schema stats).
 */
export function SchemaMeta({ schema }) {
  if (!schema?.fields) return null;

  const requiredCount = schema.fields.filter((f) => f.required).length;
  const typeSummary = [...new Set(schema.fields.map((f) => f.type))].join(', ');

  const rows = [
    { label: 'Fields', value: String(schema.fields.length) },
    { label: 'Required', value: String(requiredCount) },
    { label: 'Types', value: typeSummary },
    { label: 'Method', value: schema.httpMethod || 'POST' },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-10 gap-y-5 text-left md:max-w-md md:justify-self-end">
      {rows.map(({ label, value }) => (
        <div key={label} className="space-y-1">
          <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            {label}
          </dt>
          <dd className="text-sm font-medium text-white/90">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
