
declare module 'next/router' {
  export interface Router {
    push: (url: string, as?: string, options?: any) => Promise<boolean>;
    replace: (url: string, as?: string, options?: any) => Promise<boolean>;
    prefetch: (url: string) => Promise<void>;
    back: () => void;
    reload: () => void;
    beforePopState: (cb: any) => void;
    events: any;
    isFallback: boolean;
    pathname: string;
    query: Record<string, string | string[] | undefined>;
    asPath: string;
    basePath: string;
    locale: string;
    locales: string[];
    defaultLocale: string;
    isReady: boolean;
    isPreview: boolean;
  }

  export function useRouter(): Router;
}


declare module 'next/link' {
  import { ComponentType, ReactElement, MouseEventHandler } from 'react';

  export interface LinkProps {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
    onTouchStart?: MouseEventHandler<HTMLAnchorElement>;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  }

  const Link: ComponentType<LinkProps>;
  export default Link;
} 