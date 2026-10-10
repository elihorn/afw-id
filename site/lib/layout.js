// Layout wrappers. Markdown inside them is still markdown.
//
//   {% columns %}                     two columns (cols=3 for three); stack on small screens
//   {% column %}
//   ### Heading
//   Text, images, other components...
//   {% endcolumn %}
//   {% column %}
//   ...
//   {% endcolumn %}
//   {% endcolumns %}
//
// Leave the tags on their own lines, not indented.

function split(args) {
  const last = args[args.length - 1];
  if (last && typeof last === "object" && last.__keywords) {
    const { __keywords, ...opts } = last;
    return { pos: args.slice(0, -1), opts };
  }
  return { pos: args, opts: {} };
}

// Blank lines around the content let markdown parse it inside the HTML wrapper.
export function columns(content, ...args) {
  const { pos, opts } = split(args);
  const cols = Number(opts.cols ?? pos[0] ?? 2);
  return `\n<div class="columns" style="--cols:${cols}">\n\n${content.trim()}\n\n</div>\n`;
}

export function column(content) {
  return `\n<div class="column">\n\n${content.trim()}\n\n</div>\n`;
}
