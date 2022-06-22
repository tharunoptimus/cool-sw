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
