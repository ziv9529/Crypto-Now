function createCard(name, symbol, id, index, isToggleAfterSearch) {

    const mainDiv = document.createElement("div");
    mainDiv.classList.add("card");
    mainDiv.style.width = "15.1rem";

    const secondaryDiv = document.createElement("div");
    secondaryDiv.classList.add("card-body");

    const header = document.createElement("h5");
    header.classList.add("card-title");
    header.innerText = name;
    header.style.fontSize = "0.9em"
    const secondHeader = document.createElement("h6");
    secondHeader.classList.add("card-subtitle", "mb-2", "text-muted");
    secondHeader.innerText = symbol.toUpperCase();

    const toggleDiv = document.createElement("div");
    toggleDiv.style.position = "absolute";
    toggleDiv.style.top = "42px";
    toggleDiv.style.left = "146px";

    const toggleLable = document.createElement("label");
    toggleLable.classList.add("switch");

    const toggleInput = document.createElement("input");
    toggleInput.id = `toggle${index}`
    toggleInput.classList.add("switch-input");
    toggleInput.type = "checkbox";

    if (isToggleAfterSearch) toggleInput.checked = 1;

    toggleInput.onchange = function () {
        const isChecked = $(this).is(':checked');

        if (state.toggleCoins.length < 5) {
            if (isChecked) {
                _fillToggledArray(name, id, symbol)
            } else {
                _removeFromToggledArray(name);
            }
        } else if (state.toggleCoins.length === 5) {
            if (isChecked) {
                this.checked = 0;
                _alertToggledErr(state.toggleCoins, name);
            } else {
                _removeFromToggledArray(name)
            }
        }

        function _alertToggledErr(arr, sixCoin) {
            if (!Array.isArray(arr)) return
            let text = '';
            arr.forEach(item => text += item.coinName + ", ");
            let answer = prompt(`if you want to add ${sixCoin} to the live report, please select which coin to remove: ${text}`);
            if (answer === null || answer === "") {
                alert("empty value please romove your coin manually");
            } else {
                let deleteIndexFromToggled = getIndexByCoinName((answer.toLowerCase()), state.toggleCoins)
                if (deleteIndexFromToggled === -1 || answer === null) {
                    alert("you enter wrong spelling / invalid value please romove your coin manually");
                } else {
                    const indexOfAllCoins = getIndexByCoinName(answer.toLowerCase(), (state.coins.map(c => (c.name).toLowerCase())));
                    const toggleToRemove = $(`#toggle${indexOfAllCoins}`)[0];
                    const valueToRemove = 0;
                    toggleToRemove.checked = valueToRemove;

                    const indexToToggleOn = getIndexByCoinName(sixCoin.toLowerCase(), (state.coins.map(c => (c.name).toLowerCase())));
                    const toggleOn = $(`#toggle${indexToToggleOn}`)[0];
                    const valueToAdd = 1;
                    toggleOn.checked = valueToAdd;

                    state.toggleCoins.splice(deleteIndexFromToggled, 1)

                    _fillToggledArray(sixCoin, id, symbol)
                }
            }
        }
        function _fillToggledArray(_name, _id, _symbol) {
            state.toggleCoins.push({ coinName: _name.toLowerCase(), coinId: _id, coinSymbol: _symbol });
            let currentIndex = getIndexByCoinName(_name, state.coins)
            state.coins[currentIndex].isToggled = true;
        }
        function _removeFromToggledArray(_name) {
            const toDeleteIndex = getIndexByCoinName(((_name).toLowerCase()), state.toggleCoins);
            state.toggleCoins.splice(toDeleteIndex, 1);
            let currentIndex = getIndexByCoinName(_name, state.coins)
            state.coins[currentIndex].isToggled = false;
        }
    }

    const toggleFirsSpan = document.createElement("span");
    toggleFirsSpan.classList.add("switch-label");

    const toggleSecondSpan = document.createElement("span");
    toggleSecondSpan.classList.add("switch-handle");

    toggleLable.append(toggleInput, toggleFirsSpan, toggleSecondSpan);
    toggleDiv.append(toggleLable);

    const infoDiv = document.createElement("div");

    const moreInfo = document.createElement("a");
    moreInfo.classList.add("project-btn-sm", "mb-3");

    const loaderDiv = document.createElement("div")
    loaderDiv.id = `loader${index}`
    loaderDiv.classList.add("loader");
    loaderDiv.classList.add("hiddenDiv");

    moreInfo.setAttribute("data-bs-toggle", "collapse")

    moreInfo.role = "button";
    moreInfo.href = `#collapse${index}`;

    moreInfo.innerText = "more info";
    moreInfo.onclick = function () {
        if (this.ariaExpanded === "true") {
            _getMoreInfo();
        } else { return }
    }
    const collapsMainDiv = document.createElement("div");
    collapsMainDiv.classList.add("collapse");

    collapsMainDiv.id = `collapse${index}`

    const collapsContent = document.createElement("div");
    collapsContent.style.fontSize = "0.9em"

    collapsMainDiv.append(collapsContent);
    infoDiv.append(moreInfo, loaderDiv, collapsMainDiv);

    secondaryDiv.append(header, secondHeader, toggleDiv, infoDiv);

    mainDiv.append(secondaryDiv);

    return mainDiv;

    function _getMoreInfo() {
        let currentInCache = { isInCach: false, coinId: "" };

        const dateOfInfo = new Date();
        const currentTimeOfInfo = dateOfInfo.getTime();

        const currentCoinInfo = id;

        if (state.infoCACHE.length === 0) {
            _showInfo();
        } else {
            state.infoCACHE.map((cacheInfo) => {
                if (cacheInfo.id === currentCoinInfo) {
                    currentInCache.isInCach = true;
                    currentInCache.coinId = cacheInfo.id
                }
            });
            if (currentInCache.isInCach === false) {
                _showInfo();
            }
        }
        if (currentInCache.isInCach) {
            const coinIndex = state.infoCACHE.map((v) => { return v.id }).indexOf(currentInCache.coinId);
            if (currentTimeOfInfo - state.infoCACHE[coinIndex].timeOfInfo > 120000) {
                state.infoCACHE.splice(coinIndex, 1)
                _showInfo();
            } else {
                return
            }
        }
        async function _showInfo() {
            try {
                _drawInfoLoader()
                collapsContent.innerHTML = "";
                state.infoCACHE.push({ id: currentCoinInfo, timeOfInfo: currentTimeOfInfo });
                const infoElement = await getMoreInfoData(id)
                collapsContent.append(getInformationElement(infoElement, dateOfInfo))
                _eraseInfoLoader()
            } catch (error) {
                drawErrorMsg()
                console.log(error);
                _eraseInfoLoader()
            }
        }
    }
    function _drawInfoLoader() {
        loaderDiv.classList.remove("hiddenDiv");
        loaderDiv.classList.add("showenDiv");
    }
    function _eraseInfoLoader() {
        loaderDiv.classList.remove("showenDiv");
        loaderDiv.classList.add("hiddenDiv");
    }
}

function getIndexByCoinName(nameCoin, array) {
    if (!Array.isArray(array)) return;
    return array.findIndex((coin) => { return (coin.coinName === nameCoin || coin.name === nameCoin || coin === nameCoin) })
}

function getInformationElement(coin, date) {
    const mainDiv = document.createElement("div");
    const coinImg = document.createElement("img");
    coinImg.src = coin.image.small;
    coinImg.style.position = "absolute";
    coinImg.style.left = "181px";
    coinImg.style.top = "80px";
    coinImg.style.width = "38px";
    coinImg.style.height = "35px";
    const pricesDiv = document.createElement("div");
    const priceUsd = document.createElement("p");
    priceUsd.innerText = `price in USD: ${numberWithCommas(coin.market_data.current_price.usd)} $ `;
    const priceIls = document.createElement("p");
    priceIls.innerText = `price in EUR: ${numberWithCommas(coin.market_data.current_price.eur)} € `;
    const priceEur = document.createElement("p");
    priceEur.innerText = `price in ILS: ${numberWithCommas(coin.market_data.current_price.ils)} ₪ `;
    priceUsd.classList.add("m-0")
    priceIls.classList.add("m-0")
    priceEur.classList.add("m-0.1")
    const dateElem = document.createElement("h6");
    dateElem.className = "card-subtitle mb-2 text-muted smDate"
    dateElem.innerText = `info right to time: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    pricesDiv.append(priceUsd, priceIls, priceEur);
    mainDiv.append(coinImg, pricesDiv, dateElem)
    return mainDiv;
}

