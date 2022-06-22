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