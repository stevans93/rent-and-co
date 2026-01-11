/// <reference types="react" />
/// <reference types="react-dom" />

// Fix React 18 type compatibility with react-router-dom and react-helmet-async
// This is a known issue with @types/react@18.3.x
declare namespace React {
  interface ReactPortal {
    children?: ReactNode;
  }
}
