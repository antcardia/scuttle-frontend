export function navigate(href) {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new Event('pushstate'));
}