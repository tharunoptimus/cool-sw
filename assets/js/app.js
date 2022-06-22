function qs(element, parent = document) {
	return parent.querySelector(element)
}

document.addEventListener("click", (e) => {
    let target = e.target

    if(target.classList.contains("deleteIcon")) {
        target.parentElement.remove()
        e.stopPropagation()
    } else if(target.classList.contains("addMoreValues")) {
        let html = renderMoreInput()
        html = new DOMParser().parseFromString(html, 'text/html')
        html = html.querySelector("span.value")
        target.parentElement.querySelector(".valuesContainer").append(html)
        e.stopPropagation()
    } else if(target.id == "yesOffline" || target.id == "noOffline") {
        target.parentElement.parentElement.querySelector(".subResponse").innerText = target.getAttribute("data-id")
        e.stopPropagation()
    }
})

function renderMoreInput() {
    return `<span class="value">
        <input type="text" aria-label="Asset or Page or CDN Link">
        <img class="deleteIcon" src="/assets/images/delete.svg" height="40" width="40" alt="Delete Entry">
    </span>`
}


function getArrayValues(element) {
    let cdnClass = element
    let spans = cdnClass.querySelectorAll("span.value")
    let array = []
    spans.forEach(span => {
        let data = span.children[0].value
        if(data == "" || data == null) return
        array.push(data.trim())
    })

    return array
}


function finalize() {
    
    let swName = qs("#serviceWorkerName").value.trim()
    let cacheName = qs("#cacheName").value.trim()
    let hasOfflineHTML = document.querySelector('input[name="offlinePage"]:checked').value == 'true' ? true : false 
    let useScripts = document.querySelector('input[name="importScripts"]:checked').value == 'true' ? true : false 
    let respectNetwork = document.querySelector('input[name="respectNetwork"]:checked').value == 'true' ? true : false 

    let cacheStrategy = {
        cdn: document.querySelector('input[name="cdnDelivery"]:checked').value,
        local: document.querySelector('input[name="localDelivery"]:checked').value
    }

    let technologies = {
        backgroundSync: qs("#bgsync").checked,
        periodicSync: qs("#periodicsync").checked,
        push: qs("#webpush").checked,
        backgroundFetch: qs("#bgfetch").checked
    }
    
    let defaultAvatar = "https://avatars.dicebear.com/api/bottts/75.svg?colorful=true"
    let fallbackUrl = qs("#fallbackAvatar").value

    let imageStuff = {
        cdn: getArrayValues(qs(".getImageCDNClass")),
        fallback: fallbackUrl == "" ? defaultAvatar : fallbackUrl
    }

    let cdnStuff = {
        cdn: getArrayValues(qs(".getCDNClass"))
    }

    let preCache = {
        assetsArray: getArrayValues(qs(".precacheAssetsClass")),
        pagesArray: getArrayValues(qs(".precachePagesClass"))
    }

    return {
        hasOfflineHTML,
        swName,
        useScripts,
        cacheName,
        imageStuff,
        cdnStuff,
        preCache,
        respectNetwork,
        cacheStrategy,
        technologies
    }
}
