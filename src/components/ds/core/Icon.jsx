'use client'
import React from "react";

/* Lucide (ISC) 24x24 outline path data, inlined so the kit has no runtime
   icon dependency. Add glyphs by pasting the <path> d strings from lucide.dev. */
export const icons = {
  search: ["M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0", "M21 21l-4.3-4.3"],
  user: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"],
  bag: ["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  heart: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"],
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  close: ["M18 6 6 18", "M6 6l12 12"],
  chevronDown: ["M6 9l6 6 6-6"],
  chevronUp: ["M18 15l-6-6-6 6"],
  chevronLeft: ["M15 18l-6-6 6-6"],
  chevronRight: ["M9 18l6-6-6-6"],
  arrowRight: ["M5 12h14", "M12 5l7 7-7 7"],
  plus: ["M5 12h14", "M12 5v14"],
  minus: ["M5 12h14"],
  check: ["M20 6 9 17l-5-5"],
  star: ["M11.5 3.2a.5.5 0 0 1 .9 0l2.2 4.5 5 .7a.5.5 0 0 1 .3.9l-3.6 3.5.9 5a.5.5 0 0 1-.8.5L12 16l-4.4 2.3a.5.5 0 0 1-.8-.5l.9-5-3.6-3.5a.5.5 0 0 1 .3-.9l5-.7z"],
  truck: ["M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", "M14 9h4l4 4v4a1 1 0 0 1-1 1h-2", "M8 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", "M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"],
  trash: ["M3 6h18", "M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"],
  sliders: ["M3 6h11", "M18 6h3", "M3 12h5", "M12 12h9", "M3 18h11", "M18 18h3", "M16 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", "M10 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", "M16 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"],
  eye: ["M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z", "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"],
  instagram: ["M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z", "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "M17.5 6.5h.01"],
  mapPin: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", "M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"],
  mail: ["M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "m2 7 10 6 10-6"],
  phone: ["M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"],
  clock: ["M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0", "M12 6v6l4 2"],
  lock: ["M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  card: ["M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "M1 10h22"],
  package: ["M16.5 9.4 7.5 4.2", "M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z", "m3.3 7 8.7 5 8.7-5", "M12 22V12"],
  grid: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M14 14h7v7h-7z", "M3 14h7v7H3z"],
  tag: ["M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0L2.6 12.6A2 2 0 0 1 2 11.2V4a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6Z", "M7 7h.01"],
  leaf: ["M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z", "M2 21c0-3 1.9-5.7 4.5-7.5C9 11.8 11 10 12 8"]
};

export function Icon({ name, size = 20, strokeWidth = 1.6, className = "", style, ...rest }) {
  const d = icons[name];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" className={className}
      style={{ display: "block", flex: "none", ...style }} {...rest}>
      {d.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}
