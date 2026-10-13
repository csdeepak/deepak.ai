/**
 * Reveals `ScrollReveal` blocks straight from the server HTML, before any
 * bundle runs (D-072). A server component, so the script is inlined into the
 * page and never shipped as client JS. Render it once, at the end of the site
 * layout, after every block it needs to find; ~0.4 kB. Same threshold and
 * attribute as the component, which stays the path for client navigations.
 *
 * Measured before: a visitor who reached the Mission block on a throttled
 * phone saw it blank (opacity 0) for a median 1.45s while hydration ran.
 * Triggers (`data-reveal="trigger"`, D-074) fire on the first visible pixel.
 */
const BOOTSTRAP = `(function(){var q=document.querySelectorAll("[data-reveal]:not([data-revealed])");if(!q.length)return;function show(e){e.setAttribute("data-revealed","")}if(!("IntersectionObserver"in window)){q.forEach(show);return}function make(t){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){show(en.target);io.unobserve(en.target)}})},{threshold:t});return io}var fade=make(0.2),trigger=make(0);q.forEach(function(e){(e.getAttribute("data-reveal")==="trigger"?trigger:fade).observe(e)})})();`;

export function RevealBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />;
}
