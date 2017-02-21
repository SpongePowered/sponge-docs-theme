// Inspired by https://serviceworke.rs/cache-from-zip.html
importScripts('_static/jszip.js');

const ROOT = registration.scope;
const ID = function() {
    const parts = ROOT.split('/');
    const last = parts.length - 1;
    return `spongedocs-${parts[last-2]}-${parts[last-1]}`;
}();

const ZIP_URL = `${ROOT}${ID}.zip`;

let cachePromise;
function openCache() {
    if (!cachePromise) cachePromise = caches.open(ID);
    return cachePromise
}

addEventListener('install', event =>
    event.waitUntil(
        caches.delete(ID)
            .then(() => fetch(ZIP_URL))
            .then(response => response.status === 200 ? response.arrayBuffer()
                : Promise.reject(new Error(response.statusText)))
            .then(JSZip.loadAsync)
            .then(cacheEntries)
            .then(self.skipWaiting())
    )
);

addEventListener('activate', event => event.waitUntil(self.clients.claim()));

addEventListener('fetch', event =>
    event.respondWith(openCache()
        .then(cache => cache.match(stripRequest(event.request)))
        .then(response => response || fetch(event.request))
    )
);

// Strips query parameters from the request
function stripRequest(request) {
    const url = new URL(request.url);
    if (url.hash || url.search) {
        url.hash = '';
        url.search = '';
        return new Request(url.toString())
    } else {
        return request
    }
}

function cacheEntries(zip) {
    const files = Object.values(zip.files);
    console.log('Installing', files.length, 'files from zip');
    return Promise.all(files.map(cacheEntry))
}

function cacheEntry(file) {
    if (file.dir) return Promise.resolve();
    return file.async('blob').then(blob => openCache().then(cache => {
        const response = new Response(blob, {
            headers: {
                'Content-Type': guessContentType(file.name)
            }
        });

        const fileName = substringAfterLast(file.name, '/');
        console.log('-> Caching', file.name);

        const path = ROOT + file.name;
        if (fileName === 'index.html') {
            // Also cache for root
            return Promise.all([
                cache.put(ROOT + substringIncludingLast(file.name, '/'), response.clone()),
                cache.put(path, response)
            ])
        } else {
            return cache.put(path, response)
        }
    }))
}

function substringIncludingLast(s, c) {
    return s.substring(0, s.lastIndexOf(c) + 1)
}

function substringAfterLast(s, c) {
    return s.substring(s.lastIndexOf(c) + 1)
}

function guessContentType(name) {
    return contentTypes[substringAfterLast(name, '.')] || FALLBACK_CONTENT_TYPE;
}

const FALLBACK_CONTENT_TYPE = 'application/octet-stream';

const contentTypes = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ttf: 'application/x-font-ttf',
    eot: 'application/vnd.ms-fontobject',
    woff: 'application/font-woff',
    woff2: 'application/font-woff2'
};
