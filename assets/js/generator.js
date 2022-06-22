function useScripts() {
    return `
    /* Importing Scripts From Other Files
    The Functions defined in the script files mentioned below can be used in this service worker file.
    While Importing make sure the file exists in the specified location
    Failing to do so will result in a failed installation of the service worker
    */
    importScripts("/assets/js/utilities.js")
 
 `
}


function generalStuff (cacheName) {

    let data = ""
    data += `
    const CACHE = "${cacheName}" // Name of the Current Cache
    const DOWNLOADS = "downloads"  // Name of the Downloads Cache - For BG Fetch API
    const OFFLINE = "/offline" // The Offline HTML Page
    
    `
    return data
    
}


function imageStuff(cdnArray, fallback) {

    let data = ""
    data += `const AVATARS = "avatars" // Name of the Image Network Cache
    
    `

    if(cdnArray.length != 0) {
    data += `// The links of the Image Network URLs to Cache
    const IMAGE_NETWORK_URLS = [
    
        `

    cdnArray.forEach(element => {
        data += `"${element}",
        `
    });

    data += `
    ]
    `
    }
    data += `
    const DEFAULT_AVATAR = "${fallback}" // The Fallback image of the Image Network Cache

    `
    

    return data
}


function cdnStuff(cdnArray) {
    let data = ""
    data += `
    const CDNS = "cdn-cache" // Name of the CDN Cache
    `
    if(cdnArray.length != 0) {
    data += `// The links of the CDN URLs to Cache
    const CDN_CACHE_URLS = [
    
        `

    cdnArray.forEach(element => {
        data += `"${element}",
        `
    });

    data += `
    ]
    `
    }
    return data
}


function autoCache () {
    return `
    
    const AUTO_CACHE = [
        // The Necessary Files for the Service Worker to work
        OFFLINE,
        "/",
    ]
    `
}


function preCache(assetsArray, pagesArray) {
    let data = ""

    if(assetsArray.length == 0 && pagesArray.length == 0) {
        return `const PRE_CACHE = []`
    }

    data += `
    const PRE_CACHE = [

        // The Assets to Pre-Cache
        `

    assetsArray.forEach(element => {
        data+= `"${element}",
        `
    })

    data += `
        // The Pages to Pre-Cache 
        `
    pagesArray.forEach(element => {
        data+= `"${element}",
        `
    })

    data += `
    ]`

    return data
}


function respectNetwork(respect) {
    let data = ""
    data += `

    let CACHE_ASSETS = [] // The Assets that will be cached in the Install Event
    
    `

    if(!respect) {
        data += `
        
    CACHE_ASSETS = [...AUTO_CACHE, ...PRE_CACHE, ...DEFAULT_AVATAR]
        
        `

        return data
    }

    data += `
    // Respects the User's Connection Status
    // The assets will not be pre-cached if the user is not on a stable 4g or faster connection
    let connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection
    if (connection != undefined) {
        let slow = ["2g", "slow-2g", "3g"]
        if (slow.includes(connection.effectiveType)) CACHE_ASSETS = [...AUTO_CACHE]
        else CACHE_ASSETS = [...AUTO_CACHE, ...PRE_CACHE, ...DEFAULT_AVATAR]
    } else CACHE_ASSETS = [...AUTO_CACHE, ...PRE_CACHE, ...DEFAULT_AVATAR]
    `

    return data
}


function installAndActivate() {
    return `
    
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

    `
}


function fetchEventStart() {
    return `

    self.addEventListener("fetch", (event) => {
    `
}

function cacheFirstImage(imageCDNArray, CDNArray) {
    let data = ""

    if(imageCDNArray.length != 0) {

    data += ` 
        // Uses Cache First Falling back to Network Strategy for the Image CDNS
        if (`

    imageCDNArray.forEach(e => {
        data += `
            event.request.url.includes("${e}") ||`
    })

    data += ` false
        ) {
            event.respondWith(
                caches.open(AVATARS).then((cache) => {
                    return cache.match(event.request).then((response) => {
                        if (response) return response
                        return fetch(event.request)
                            .then((response) => {
                                cache.put(event.request, response.clone())
                                return response
                            })
                            .catch(() => {
                                return caches.match(DEFAULT_AVATAR)
                            })
                    })
                })
            )
            return
        }
        
        
    `
    }

    if(CDNArray.length != 0) {

    data += `   // Uses Cache First Network Strategy for the CDNS

        if (`
    CDNArray.forEach(e => {
        data += `
            event.request.url.includes("${e}") ||`
    })

    data += ` false
        ) {
            event.respondWith(
                caches.open(CDNS).then((cache) => {
                    return cache.match(event.request).then((response) => {
                        if (response) return response
                        return fetch(event.request)
                            .then((response) => {
                                cache.put(event.request, response.clone())
                                return response
                            })
                    })
                })
            )
            return
        }


        `
    }
    return data
        
}