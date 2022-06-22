function qs(element, parent = document) {
	return parent.querySelector(element)
}

let firstPanel = qs(".firstPanel")
let secondPanel = qs(".secondPanel")
let thirdPanel = qs(".thirdPanel")
let fourthPanel = qs(".fourthPanel")
let fifthPanel = qs(".fifthPanel")

let firstProgress = qs(".firstProgress")
let secondProgress = qs(".secondProgress")
let thirdProgress = qs(".thirdProgress")
let fourthProgress = qs(".fourthProgress")

let firstNextButton = qs("#firstNextButton")
let firstPrevButton = qs("#firstPrevButton")
let secondNextButton = qs("#secondNextButton")
let secondPrevButton = qs("#secondPrevButton")
let thirdNextButton = qs("#thirdNextButton")
let thirdPrevButton = qs("#thirdPrevButton")
let finishButton = qs("#finishButton")

function setDisplay(element) {
	firstPanel.classList.remove("showPanel")
	secondPanel.classList.remove("showPanel")
	thirdPanel.classList.remove("showPanel")
	fourthPanel.classList.remove("showPanel")
	fifthPanel.classList.remove("showPanel")

	element.classList.add("showPanel")
}

function showProgress(number) {
	let elements = [
		firstProgress,
		secondProgress,
		thirdProgress,
		fourthProgress,
	]
	console.log(elements)
	for (let j = 0; j < 4; j++) {
		elements[j].classList.remove("progressActive")
	}
	for (let i = 0; i < number; i++) {
		elements[i].classList.add("progressActive")
	}
}

function removeProgress() {
	qs(".formProgress").remove()
}

function navigate(number) {
	switch (number) {
		case 1:
			showProgress(1)
			setDisplay(firstPanel)
			break
		case 2:
			showProgress(2)
			setDisplay(secondPanel)
			break
		case 3:
			showProgress(3)
			setDisplay(thirdPanel)
			break
		case 4:
			showProgress(4)
			setDisplay(fourthPanel)
			break
		case 5:
			removeProgress()
			setDisplay(fifthPanel)
			break

		default:
			break
	}
}

firstPrevButton.addEventListener("click", () => navigate(1))
firstNextButton.addEventListener("click", () => navigate(2))
secondPrevButton.addEventListener("click", () => navigate(2))
secondNextButton.addEventListener("click", () => navigate(3))
thirdPrevButton.addEventListener("click", () => navigate(3))
thirdNextButton.addEventListener("click", () => navigate(4))
finishButton.addEventListener("click", () => navigate(5))

firstProgress.addEventListener("click", () => navigate(1))
secondProgress.addEventListener("click", () => navigate(2))
thirdProgress.addEventListener("click", () => navigate(3))
fourthProgress.addEventListener("click", () => navigate(4))
