async function getMoreInfoData(coinId) {
    try {
        const result = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`)
        const jsonResult = await result.json();
        return jsonResult
    } catch (error) {
        drawErrorMsg();
        console.log(error);
    }
}