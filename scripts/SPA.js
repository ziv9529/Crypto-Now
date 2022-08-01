$("#home-btn").on("click", function () {
    if (myChart != null) {
        clearInterval(drawInterval)
    }
    $("#emptyReports").css({ visibility: "hidden" })

    togglePages("1");
});

$("#CryptoWall-btn").on("click", function () {
    if (myChart != null) {
        clearInterval(drawInterval)
    }
    $("#emptyReports").css({ visibility: "hidden" })
    togglePages("2");
});

$("#liveReports-btn").on("click", function () {
    togglePages("3");
});

$("#about-btn").on("click", function () {
    if (myChart != null) {
        clearInterval(drawInterval)
    }
    $("#emptyReports").css({ visibility: "hidden" })
    togglePages("4");
});

function togglePages(pageNumber) {
    const pagesArr = $(".page");

    for (let index = 1; index <= pagesArr.length; index++) {
        $(`#page-${index}`).removeClass("current-page");
    }
    $(`#page-${pageNumber}`).addClass("current-page");
}