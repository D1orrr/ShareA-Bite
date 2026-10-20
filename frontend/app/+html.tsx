import React, { PropsWithChildren } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

const css = `
body { background: #faf8ff; }
:focus-visible { outline: 3px solid #006948; outline-offset: 2px; }
@media (prefers-color-scheme: dark) {
  body { background: #0d1322; }
  :focus-visible { outline-color: #68dba9; }
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
