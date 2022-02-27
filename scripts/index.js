$(document).ready(init)

const state = {
    coins: [],
    toggleCoins: [],
    infoCACHE: []
}

let myChart = null;
let drawInterval = null;

function init() {

    getCoinsData();

    $("#searchCryptoBtn").on("click", function () {
        searchCryptoByInput();
    })

    $("#clearInputBtn").on("click", function () {
        $("#cryptoSearch").val("")
        draw(state.coins)
    })

    $("#clear-wall").on("click", function () {
        clearCryptoWall();
    })

    $("#liveReports-btn").on("click", function () {
        getLiveReports()
    })

}

async function getCoinsData() {
    try {
        const result = await fetch("https://api.coingecko.com/api/v3/coins")
        const coinsArray = await result.json();
        const allcoins = coinsCardFactory(coinsArray);

        allcoins.map(function (c) {
            state.coins.push(c)
        })

        draw(allcoins);

    } catch (error) {
        drawErrorMsg()
        console.log(error);
    }
}

function coinsCardFactory(data) {
    if (!Array.isArray(data)) return;

    return data.map(function (coin) {
        return new CoinCard(coin.name, coin.symbol, coin.id)
    })

}

function searchCryptoByInput() {
    const currentVal = $("#cryptoSearch").val();
    const newData = []
    if (!Array.isArray(state.coins)) return;
    state.coins.map((c) => {
        if ((c.name.toLowerCase()).includes(currentVal.toLowerCase()) ||
            (c.symbol.toLowerCase()).includes(currentVal.toLowerCase())) {
            newData.push(c);
        }
    })
    draw(newData);
}

async function getLiveReports() {
    if (myChart != null) myChart.destroy();

    if (state.toggleCoins.length === 0) {
        $("#emptyReports").css({ visibility: "visible", position: "block" })
        return
    }

    drawChartsLoader();

    const chartColors = ['#e6ccb2', '#ddb892', '#b08968', '#7f5539', '#9c6644'];

    const coinsToReport = [];
    if (!Array.isArray(state.toggleCoins)) return;
    state.toggleCoins.map((c) => { coinsToReport.push(c.coinSymbol.toUpperCase()) });

    let timesLables = [];

    let liveDataObjectsArr = [];

    const reportsBaseUrl = 'https://min-api.cryptocompare.com/data/pricemulti';
    let reportsCoinsParams = '';
    let reportsCurrenciesParams = 'USD'

    state.toggleCoins.map((coin) => {
        return reportsCoinsParams += `${coin.coinSymbol.toUpperCase()},`
    })

    drawInterval = setInterval(async function () {
        try {
            const result = await fetch(`${reportsBaseUrl}?fsyms=${reportsCoinsParams}&tsyms=${reportsCurrenciesParams}`)
            const liveReportsJson = await result.json();
            _drawChart(await liveReportsJson)
        } catch (error) {
            console.log(error);
            eraseChartsLoader();
        }
    }, 2000);


    function _drawChart(dataObj) {

        let coinsDatasheet = [];

        if (myChart != null) {
            myChart.destroy();
        }

        const liveReportTime = new Date();
        const currentTime = `${liveReportTime.getHours()}:${liveReportTime.getMinutes()}:${liveReportTime.getSeconds()}`
        timesLables.push(currentTime);

        liveDataObjectsArr.push(dataObj)
        coinsToReport.map((coinToReport, index) => {

            coinsDatasheet.push({
                label: coinToReport,
                backgroundColor: chartColors[index],
                borderColor: chartColors[index],
                data: liveDataObjectsArr.map((c) => { return Object.values(Object.values(c)[index])[0] }),
            })
        })
        const coinsChartsData = {
            labels: timesLables,
            datasets: coinsDatasheet
        };

        const config = getChartCongig(coinsChartsData);

        myChart = new Chart(
            $("#myChart"),
            config
        );

        eraseChartsLoader()
    }

}
function clearCryptoWall() {
    if (!Array.isArray(state.coins)) return;
    for (let index = 0; index < state.coins.length; index++) {
        const ref = $(`#toggle${index}`)[0];
        const valueToRemove = 0;
        ref.checked = valueToRemove;
    }
    state.coins.map((c) => {
        c.isToggled = false;
    })
    state.toggleCoins = [];
}
function drawErrorMsg() {
    $("#error-section").css({ visibility: "visible" })
    setInterval(() => {
        $("#error-section").css({ visibility: "hidden" })
    }, 5000);
}
function drawChartsLoader() {
    $("#charts-loader").removeClass("hiddenDiv").addClass("showenDiv")
}
function eraseChartsLoader() {
    $("#charts-loader").removeClass("showenDiv").addClass("hiddenDiv")
}
function numberWithCommas(x) {
    return x.toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
function getChartCongig(_coinsChartsData) {
    return {
        type: 'line',
        data: _coinsChartsData,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: function (value) {
                            return '$' + numberWithCommas(value);;
                        }
                    }
                }
            }
        }
    }
}
function draw(arr) {
    if (!Array.isArray(arr)) return;
    $("#coinsContainer").html("")
    const coinsCards = arr.map(function (c, index) {
        return createCard(c.name, c.symbol, c.id, index, c.isToggled)
    })
    document.querySelector("#coinsContainer").append(...coinsCards)
}

