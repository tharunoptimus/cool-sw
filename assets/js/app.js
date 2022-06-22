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


