import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps, children: React.ReactNode, viewBox = "0 0 24 24") {
  const { width = 20, height = 20, ...rest } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return base(props, <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>);
}

export function IconClose(props: IconProps) {
  return base(props, <path d="M6 6l12 12M18 6L6 18" />);
}

export function IconClipboard(props: IconProps) {
  return base(props, <><rect x="8" y="3" width="8" height="4" rx="1" /><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" /></>);
}

export function IconDownload(props: IconProps) {
  return base(props, <><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" /></>);
}

export function IconCheck(props: IconProps) {
  return base(props, <path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth={3} />);
}

export function IconLock(props: IconProps) {
  return base(props, <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
}

export function IconAgeRestricted(props: IconProps) {
  return base(
    props,
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10 10 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.9" />
      <path d="M6.6 7.6A17 17 0 0 0 2.5 12s3.5 6 9.5 6a9 9 0 0 0 4.4-1.1" />
      <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
    </>,
  );
}

export function IconLinkBroken(props: IconProps) {
  return base(props, <><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 0 1 4 8" /><path d="M3 3l18 18" /></>);
}

export function IconRefreshCw(props: IconProps) {
  return base(props, <><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v5h-5" /></>);
}

export function IconArrowUp(props: IconProps) {
  return base(props, <><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></>);
}

export function IconArrowDown(props: IconProps) {
  return base(props, <><path d="M12 5v14" /><path d="M6 13l6 6 6-6" /></>);
}

export function IconPlay(props: IconProps) {
  const { width = 18, height = 18, ...rest } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

export function IconGrid(props: IconProps) {
  return base(props, <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>);
}

export function IconFilm(props: IconProps) {
  return base(props, <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>);
}

export function IconMusic(props: IconProps) {
  return base(props, <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>);
}

export function IconLayers(props: IconProps) {
  return base(props, <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>);
}

export function IconLink(props: IconProps) {
  return base(props, <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>);
}

export function IconGlobe(props: IconProps) {
  return base(props, <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" /></>);
}

export function IconChevronDown(props: IconProps) {
  return base(props, <path d="M6 9l6 6 6-6" strokeWidth={2.6} />);
}

export function IconSun(props: IconProps) {
  return base(props, <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
}

export function IconMoon(props: IconProps) {
  return base(props, <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />);
}

export function IconShield(props: IconProps) {
  return base(props, <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />);
}

export function IconPlus(props: IconProps) {
  return base(props, <path d="M12 5v14M5 12h14" strokeWidth={2.6} />);
}

/** The brand mark — provided by the user (design/xeetloot-icon/favicon.svg),
 * reused inline (not an <img>) so it can take `currentColor` and scale
 * crisply next to the "XeetLoot" wordmark. */
export function BrandMark(props: IconProps) {
  const { width = 30, height = 30, ...rest } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 186.71 100.86" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M136.08.18H52.53C26.84.18,3.85,18.64.76,44.14c-3.71,30.56,20.05,56.54,49.87,56.54,18.05,0,33.87-9.52,42.73-23.8,10.29,16.59,29.95,26.75,51.6,23.05,20.11-3.44,36.51-19.39,40.4-39.41C191.6,28.34,167.13.18,136.08.18ZM80.67,54.93c-1.83,11.97-11.62,21.75-23.58,23.58-13.43,2.06-25.42-5.31-30.42-16.49,2.2,2.35,5.01,4.13,8.17,4.9,12.65,3.05,23.76-8.06,20.71-20.71-1.43-5.95-6.31-10.82-12.25-12.25-6.54-1.58-12.61.67-16.59,4.91,3.87-8.57,11.91-15.06,21.4-16.51,19.21-2.94,35.51,13.36,32.57,32.57ZM162.01,54.92c-1.83,11.94-11.59,21.7-23.53,23.53-13.4,2.05-25.36-5.3-30.36-16.46,2.2,2.35,5,4.12,8.15,4.88,12.62,3.04,23.7-8.04,20.66-20.66-1.43-5.93-6.29-10.8-12.23-12.23-6.52-1.57-12.58.67-16.55,4.9,3.86-8.55,11.88-15.02,21.35-16.47,19.16-2.93,35.43,13.33,32.5,32.5Z" />
    </svg>
  );
}
