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

function networkFirstImage(imageCDNArray, CDNArray) {
    let data = ""

    if (imageCDNArray.length != 0) {

    data += ` 
        // Uses Network First Falling back to Cache Strategy for the Image CDNS
        if (`

    imageCDNArray.forEach(e => {
        data += `
            event.request.url.includes("${e}") ||`
    })

    data += ` false
        ) {
            event.respondWith(
                fetch(event.request)
                .then((response) => {
                    caches.open(AVATARS).then((cache) => {
                        cache.put(event.request, response.clone())
                    })
                    return response
                })
                .catch(() => {
                    caches.open(AVATARS).then((cache) => {
                        return cache.match(event.request).then((response) => {
                            if(response) return response
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

    data += `   // Uses Network First Falling back to Cache Strategy for the CDNS

        if (`
    CDNArray.forEach(e => {
        data += `
            event.request.url.includes("${e}") ||`
    })

    data += ` false
        ) {
            event.respondWith(
                fetch(event.request)
                .then((response) => {
                    caches.open(CDNS).then((cache) => {
                        cache.put(event.request, response.clone())
                    })
                    return response
                })
                .catch(() => {
                    caches.open(CDNS).then((cache) => {
                        return cache.match(event.request).then((response) => {
                            if(response) return response
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

function otherRequests() {
    return `
    
        // Requests to other domains and requests other than GET to this web app will always fetch from network
        if (
            !event.request.url.startsWith(self.location.origin) ||
            event.request.method !== "GET"
        ) {
            return void event.respondWith(fetch(event.request).catch((err) => console.log(err)))
        }
        
    `
}

function networkFirstLocal() {
    return `
        // Network First Falling Back to Cache Strategy for Local Assets
        event.respondWith(
                
            fetch(event.request)
            .then((response) => {
                caches.open(CACHE).then((cache) => {
                    cache.put(event.request, response.clone())
                })
                return response
            })
            .catch((_err) => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse
                    }

                    return caches.open(CACHE).then((cache) => {
                        const offlineRequest = new Request(OFFLINE)
                        return cache.match(offlineRequest)
                    })
                })
            })
            
        )
    `
}

function cacheFirstLocal() {
    return `
        // Cache First Falling Back to Network Strategy for Local Assets
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    return response
                }

                return fetch(event.request).then((response) => {
                    caches.open(CACHE).then((cache) => {
                        cache.put(event.request, response.clone())
                        return response
                    })
                }).catch(err => {
                    return caches.open(CACHE).then((cache) => {
                        const offlineRequest = new Request(OFFLINE)
                        return cache.match(offlineRequest)
                    })
                })
            })
        )
    `
}

function fetchEventEnd() {
    return `
    })
    `
}

function backgroundSync() {
    return `
    
    // ---------------------------------------- BACKGROUND SYNC ----------------------------------------
    /* Steps to Perform Background Sync
        1. Setup a tag name for a single task
        2. Register the task with the set up tag name
        3. Listen for the 'sync' event
        4. If the event.tag matches your set up tag run a function
    */

    // A Simple Tag Name for a single Background Sync Task
    // You can add multiple tags and call the requestBackgroundSync Function to register all
    let backgroundSyncTagName = 'test-tag-from-devtools'

    // Registering the Background Sync Task with the Tag Name
    requestBackgroundSync(backgroundSyncTagName)

    // Function to register a Background Sync
    // Provide a tag name to register
    async function requestBackgroundSync(backgroundSyncTagName) {
        try {
            await self.registration.sync.register(backgroundSyncTagName)
        } catch (error) {
            console.log("Unable to REGISTER background sync", error)
            setTimeout(() => requestBackgroundSync(backgroundSyncTagName), 10000)
        }
    }

    // This is the SYNC Event Listener - Background Sync
    // The event has a tagname with which you can run different functions
    self.addEventListener('sync', event => {
        if (event.tag === backgroundSyncTagName) {
            console.log("Executing Background Sync of tagname: " + event.tag)
            event.waitUntil(backgroundStuff()) // Actually Executing backgroundStuff function
        }
    })

    function backgroundStuff() {
        // This function will be executed when the browser sends a sync event
        console.log("Background stuff")
    }

    // ---------------------------------------- --------------- ----------------------------------------

    
    `
}

function periodicBackSync() {
    return `
    
    
    // ------------------------------------ PERIODIC BACKGROUND SYNC -----------------------------------
    /* Steps to Perform Periodic Background Sync
        1. Setup a tag name for a single task
        2. Register the task with the set up tag name
        3. Listen for the 'periodicsync' event
        4. If the event.tag matches your set up tag run a function
    */


    // A Simple Tag Name for a single Periodic Background Sync Task
    // You can add multiple tags and call the requestPeriodicBGSync Function to register all
    let periodicSyncTagName = 'test-tag-from-devtools'

    // Registering the Periodic Background Sync Task with the Tag Name
    requestPeriodicBGSync(periodicMeowSyncTagName, 0.5)

    // Function to register a Periodic Background Sync
    // Provide a tag name to register
    // Also provide an optional parameter hours to specify the interval - default is 1 hour
    async function requestPeriodicBGSync(tagName, hours = 1) {
        try {
            await self.registration.periodicSync.register(tagName, {
                minInterval: hours * 60 * 60 * 1000,
            })
        } catch (err) {
            console.log("Unable to REGISTER periodic sync " + err)
            setTimeout(() => requestPeriodicBGSync(tagName, hours), 10000)
        }
    }

    // This is the PERIODICSYNC Event Listener - Periodic Background Sync
    // This event has a tagname with which you can run different functions
    self.addEventListener("periodicsync", (event) => {
        if (event.tag == periodicSyncTagName) {
            console.log("Executing Periodic Background Sync of tagname: " + event.tag)
            event.waitUntil(periodicStuff()) // Actually Executing the periodicStuff function
        }
    })

    function periodicStuff() {
        // This function will be executed every specified interval
        console.log("Periodic stuff")
    }


    // ------------------------------------ ------------------------ -----------------------------------

    
    `
}

function push() {
    return `
    
        
    // --------------------------------------- Browser Push Event --------------------------------------
    /* Steps to Setup Browser Push
        1. Listen for the 'push' event
        2. If there is 'event', a push message has been sent
        3. 'event.data' will have the data associated with the Push Event - read only
        4. 'event.data.json()' will return the encoded information
        5. 'event.data.text()' will just return the tag name from dev tools 
            - Works only with Dev Tools - Haven't tested out yet
    */
    self.addEventListener("push", event => {
        if (event.data) {
            let tagName = event.data.text()
            console.log("Received push message with tag " + tagName)
        }
    })

    // ------------------------------------ ------------------------ -----------------------------------
    
    `
}

function backgroundFetch() {
    return `
    
    
    // ------------------------------------ Background Fetch API ---------------------------------------
    /* (*) Available Only on Chrome Browsers only after enabling the API from the command line */
    /* (*) Just try this for fun. Not to be used in production.... After all this is for fun 😏*/
    /* Steps to Setup Background Fetch
        1. Learn more about it from https://developer.chrome.com/blog/background-fetch/

       TLDR:
        1. After service worker is installed, background fetch can be used to download insanely large
            files
        2. When the user is still on the web app, you need to update the UI in the main script
        3. If the user leaves while or before the background fetch begins or is running 
            service worker events will help you manage UI and serve notifications
        4. Again Read the above link once more 
        5. This section will contain just the working boiler plate code to get background fetch 
            background events up and running. You need to change it according to your need.
    */


    // Your background fetch ran successfully
    // Now update the UI - The Browser's Native UI - You can update only once
    self.addEventListener("backgroundfetchsuccess", (event) => {
        const bgFetch = event.registration

        event.waitUntil(
            (async function () {
                // Create/open a cache.
                const cache = await caches.open(DOWNLOADS)
                // Get all the records.
                const records = await bgFetch.matchAll()
                // Copy each request/response across.
                const promises = records.map(async (record) => {
                    const response = await record.responseReady
                    await cache.put(record.request, response)
                })

                // Wait for the copying to complete.
                await Promise.all(promises)

                // Update the progress notification.
                event.updateUI({ title: "Download Complete 🥳🎉" })
            })()
        )
    })

    // One or more of the fetches failed.
    self.addEventListener("backgroundfetchfailure", (event) => {
        console.log(event)
        console.log("One or More of the Background Fetch failed...")
    })

    // Reacting to click by user on the native progress bar
    self.addEventListener("backgroundfetchclick", (event) => {
        const bgFetch = event.registration

        if (bgFetch.result === "success") {
            clients.openWindow("/successPage")
        } else {
            clients.openWindow("/otherPage-Still-Success")
        }
    })

    // ------------------------------------ ------------------------ -----------------------------------

    
    `
}


// let options = {
//     swName: "sw",
//     useScripts: false,
//     cacheName: "content-v1",
//     imageStuff: {
//         cdn: [
            
//         ],
//         fallback: ""
//     },
//     cdnStuff: {
//         cdn: [
//             ""
//         ]
//     },
//     preCache: {
//         assetsArray: [
//             ""
//         ],
//         pagesArray: [
//            ""
//         ]
//     },
//     respectNetwork: true,
//     cacheStrategy: {
//         cdn: "cacheFirst",
//         local: "cacheFirst"
//     },
//     technologies: {
//         backgroundSync: false,
//         periodicSync: false,
//         push: false,
//         backgroundFetch: false
//     }
// }

function generate(options) {
    let data = ""

    if(options.useScripts) {
        data += useScripts()
    }

    data += generalStuff(options.cacheName)

    data += imageStuff(options.imageStuff.cdn, options.imageStuff.fallback)

    data += cdnStuff(options.cdnStuff.cdn)

    data += autoCache()

    data += preCache(options.preCache.assetsArray, options.preCache.pagesArray)

    data += respectNetwork(options.respectNetwork)

    data += installAndActivate()

    data += fetchEventStart()

    if(options.cacheStrategy.cdn == "cacheFirst") {
        data += cacheFirstImage(options.imageStuff.cdn, options.cdnStuff.cdn)
    } else if(options.cacheStrategy.cdn == "networkFirst") {
        data += networkFirstImage(options.imageStuff.cdn, options.cdnStuff.cdn)
    }

    data += otherRequests()
   
    if(options.cacheStrategy.local == "cacheFirst") {
        data += cacheFirstLocal()
    } else if(options.cacheStrategy.local == "networkFirst") {
        data += networkFirstLocal()
    }

    data += fetchEventEnd()

    if(options.technologies.backgroundSync) data += backgroundSync()
    
    if(options.technologies.periodicSync) data += periodicBackSync()
    
    if(options.technologies.push) data += push()
    
    if(options.technologies.backgroundFetch) data += backgroundFetch()

    return data

}