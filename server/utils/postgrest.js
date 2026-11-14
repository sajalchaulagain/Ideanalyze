/*
  PostgREST receives filters as a query string. A user-supplied search term must
  not be able to inject extra filter syntax, and LIKE wildcards must be treated
  as literal characters.

  There are two escaping layers:
    1. PostgREST's double-quoted value syntax consumes one level of backslash
       escaping (`\\` becomes `\`), so a quote needs `\"`.
    2. PostgreSQL LIKE treats `\%`, `\_` and `\\` as literals, so the pattern
       needs `\` before each wildcard after PostgREST has decoded the value.

  That is why `%` and `_` are sent with two backslashes and a literal backslash
  with four.
*/
function escapeLikeTerm(value) {
  return String(value ?? "").replace(/[\\%_"]/g, (character) => {
    if (character === '"') return '\\"';
    if (character === "\\") return "\\\\\\\\";
    return `\\\\${character}`;
  });
}

function ilikeAny(columns, term) {
  const pattern = `%${escapeLikeTerm(term)}%`;
  return columns.map((column) => `${column}.ilike."${pattern}"`).join(",");
}

module.exports = { escapeLikeTerm, ilikeAny };
