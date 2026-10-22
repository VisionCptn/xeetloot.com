// Blocking inline script (must run before first paint) — reads the saved
// theme and sets data-theme on <html> before any CSS using the tokens in
// globals.css paints, avoiding a dark/light flash. Site default is dark
// (brief: "dark default + light"), not the OS preference.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('xl-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark')}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
