// tank-wiki/src/pages/_app.tsx

import type { AppProps } from 'next/app';
import { BrowserRouter } from 'react-router-dom'; // only if you're using react-router
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <BrowserRouter>
      <Component {...pageProps} />
    </BrowserRouter>
  );
}
