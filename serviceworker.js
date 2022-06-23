
    const CACHE = "content-v1" // Name of the Current Cache
    const DOWNLOADS = "downloads"  // Name of the Downloads Cache - For BG Fetch API
    const OFFLINE = "/offline" // The Offline HTML Page
    
    const AVATARS = "avatars" // Name of the Image Network Cache
    
    
    const DEFAULT_AVATAR = "" // The Fallback image of the Image Network Cache

    
    const CDNS = "cdn-cache" // Name of the CDN Cache
    
    
    const AUTO_CACHE = [
        // The Necessary Files for the Service Worker to work
        OFFLINE,
        "/",
    ]
    
    const PRE_CACHE = [

        // The Assets to Pre-Cache
        "/assets/css/main.css",
        "/assets/images/add.svg",
        "/assets/images/delete.svg",
        "/assets/images/download.svg",
        "/apple-touch-icon.png",
        "/site.webmanifest",
        
        // The Pages to Pre-Cache 
        
    ]

    let CACHE_ASSETS = [] // The Assets that will be cached in the Install Event
    
    
        
    CACHE_ASSETS = [...AUTO_CACHE, ...PRE_CACHE, ...DEFAULT_AVATAR]
        
        
    
    // The Install Event is fired when the Service Worker is first installed.
    // This is where we can set up things in the Service Worker that are required
    // The Pre-Cache is done at the install event.
    self.addEventListener("install", (event) => {
        event.waitUntil(
            caches
                .open(CACHE) // Opening the Cache
                .then((cache) => cache.addAll(CACHE_ASSETS)) // Adding the Listed Assets to the Cache
                .then(self.skipWaiting()) // The Service Worker takes control of the page immediately
        )
    })


    // The Activate Event is fired when the Service Worker is first installed.
    // This is where we can clean up old caches.
    self.addEventListener("activate", (event) => {
        event.waitUntil(
            caches
                .keys()
                .then((cacheNames) => {
                    // Remove caches that are not required anymore
                    // This filters the current cache, Image Network Cache and CDN Cache
                    return cacheNames.filter(
                        (cacheName) =>
                            CACHE !== cacheName &&
                            AVATARS !== cacheName &&
                            CDNS !== cacheName
                    )
                })
                .then((unusedCaches) => {
                    console.log("DESTROYING CACHE", unusedCaches.join(","))
                    return Promise.all(
                        unusedCaches.map((unusedCache) => {
                            return caches.delete(unusedCache)
                        })
                    )
                })
                .then(() => self.clients.claim()) // The Service Worker takes control of all pages immediately
        )
    })

    

    self.addEventListener("fetch", (event) => {
    
    
        // Requests to other domains and requests other than GET to this web app will always fetch from network
        if (
            !event.request.url.startsWith(self.location.origin) ||
            event.request.method !== "GET"
        ) {
            return void event.respondWith(fetch(event.request).catch((err) => console.log(err)))
        }
        
    
        // Cache First Falling Back to Network Strategy for Local Assets
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    return response
                }

                return fetch(event.request).then((response) => {
                    caches.open(CACHE).then((cache) => {
                        cache.put(event.request, response)
                        return response.clone()
                    })
                }).catch(err => {
                    return caches.open(CACHE).then((cache) => {
                        const offlineRequest = new Request(OFFLINE)
                        return cache.match(offlineRequest)
                    })
                })
            })
        )
    
    })
    