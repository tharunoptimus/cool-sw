# Instant Service Worker Generator with Customization - Batteries Included 🔋

# Questionnaire for the Generation

## General Configuration

1. What do you want to name your service worker?
1. What do you want the name of the cache to be?
1. Do you have an offline.html page? 
    - If yes, make sure it is located in the root of your project. 
    - If no, don't worry. We will create one for you.
1. Would you want to use some of the functions from your script files?


## Caching Strategy (Pre Cache - Local Only)

1. Do you want to respect the user's network connection when caching?
1. Do you want to Pre-Cache your assets?
    - Enter the absolute links to the assets you want to cache (relative to the root of your site)
    - Plus Buttons to add more assets
1. Do you want to Pre-Cache your pages?
    - Enter the absolute links to the pages you want to cache (relative to the root of your site)
    - Plus Buttons to add more pages

## Life Cycle

1. Do you use any CDNs? If so, do you want to cache them as well? If yes, add the links to the cdns.
    - Just enter the hostnames of the CDNs. For Eg: If it's jQueryV3.6.0 from Google, just `ajax.googleapis.com` is enough
    - Plus Buttons to add more CDNs
1. Do you use an Image Network like 8biticon or face.co? If yes, add the links to the Image CDNS. Also enter an absolute path of a fallback image. The image that will be used when the service worker cannot fetch the image from the CDN.
    - Just enter the hostnames of the Image CDNs. For Eg: If it's dicebear, just `avatars.dicebear.com` is enough
    - Plus Buttons to add more CDNs
    - Default Fallback Image Path
1. Choose the Delivery Strategy of the Fetch Event 
    - Cache Only and Network Only stuff don't work good in my experience. So you got only 2 options. 😈
    - For local files, belonging to your web app
        - Do you want to use network first, fallback to cache?
        - Do you want to use cache first, fallback to network?
    - For CDNs, Image Network
        - Do you want to use network first, fallback to cache?
        - Do you want to use cache first, fallback to network?

## Other Browser Technologies
1. Browser Technologies you would want to use in your web app:
    - Background Sync
    - Periodic Background Sync
    - Background Fetch
    - Push API



# Results Page
- The serive worker is ready to be downloaded - Click to Download
- Place the service worker in the root of your site
- Add this to end of your `<body>` tag in your index.html file:
    ```js
    <script defer>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/serviceWorkerName.js');
        }
    </script>    
    ```
- Make sure the assets you want to cache are in the specified path. Failure to do so will result in a failed installation of the service worker. 
- Background Sync, Periodic Background Sync, Background Fetch will not work unless the web app is installed as a Progressive Web App (PWA) and is served from a HTTPS server or a localhost server
- Thanks for Using this Service Worker Generator! :)