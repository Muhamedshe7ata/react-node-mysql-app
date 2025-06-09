/// <reference types="vite/client" />



interface ImportMetaEnv {
  readonly REACT_APP_API_URL: string;
  // Add any other environment variables you might use in your frontend
  // readonly VITE_ANOTHER_VAR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
