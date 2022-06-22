document.addEventListener("click", (e) => {
    let target = e.target

    if(target.classList.contains("deleteIcon")) {
        target.parentElement.remove()
        e.stopPropagation()
    } else if(target.classList.contains("addMoreValues")) {
        let html = renderMoreInput()
        let valuesContainer = target.parentElement.querySelector(".valuesContainer")
        valuesContainer.innerHTML += html
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
