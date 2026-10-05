// A stand-in for Vite's types, so StadiaRef's own declarations can be
// checked with skipLibCheck off without checking all of Vite's.
export interface Plugin { name: string; [key: string]: unknown; }
