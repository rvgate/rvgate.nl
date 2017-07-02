var fetchquote = function() {
    $.ajax({
        url: "https://api.forismatic.com/api/1.0/?",
        dataType: "jsonp",
        data: "method=getQuote&format=jsonp&lang=en&jsonp=?",
        success: function (response) {
            if (response.quoteAuthor) {
                $("#quote_body").text(response.quoteText);
                $("#quote_footer").text(response.quoteAuthor);
            }
        },
        error: function () {
            $("#quote_body").text("It will be easy");
            $("#quote_footer").text("Nobody");
        }
    });
}