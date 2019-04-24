// Grab the articles as a json
$.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + 
        // "<a href='" + data[i].link + "'></a>" + "</p>");

        // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + 
        // data[i].link + "</p>");

        //  $("#articles").append(`<p data-id="${data[i]._id}"> ${data[i].title} <br /><a href="${data[i].link}></a></p>`);

        var newArticleCard = $("<div>");
        newArticleCard.addClass("card");
        var newArticleTitle = $("<h3>");
        var newArticleSummary = $("<h5>");
        // var newArticleLink = $("<h7>");
        var newArticleLink = $("<a>");
        newArticleLink.attr("href", data[i].link);
        var hRule = $("<hr>");
        var spaceBreak = $("<br>");
        newArticleTitle.text(data[i].title);
        newArticleTitle.css({
            color: "red"
        })
        newArticleSummary.text(data[i].summary);
        // newArticleLink.text(data[i].link);
        newArticleCard.append(newArticleTitle);
        newArticleCard.append(spaceBreak);
        newArticleCard.append(newArticleSummary);
        newArticleCard.append(spaceBreak);
        newArticleCard.append(newArticleLink);
        newArticleCard.append(spaceBreak);
        var commentButton = $("<button>");
        commentButton.text("Manage Comments");
        commentButton.addClass("manage-comments");
        // commentButton.css({
        //     width: "200px"
        // });
        newArticleCard.append(commentButton);
        newArticleCard.append(hRule);
        $("#articles").append("<p data-id='" + data[i]._id + "'></p>");
        $("#articles").append(newArticleCard);

    }
});


// Whenever someone clicks a p tag
$(document).on("click", ".manage-comments", function () {
    // Empty the comments from the comments section
    $("#comments").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the comment information to the page
        .then(function (data) {
            console.log(data);
            // The title of the article
            $("#comments").append("<h3>" + data.title + "</h3>");
            // An input to enter a new title
            $("#comments").append("<input id='titleinput' name='title' >");
            // A textarea to add a new comment body
            $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new comment, with the id of the article saved to it
            $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");
            $("#comments").append("<button data-id='" + data._id + "' id='deletecomment'>Delete Comment</button>");

            // If there's a comment in the article
            if (data.comment) {
                // Place the title of the comment in the title input
                $("#titleinput").val(data.comment.title);
                // Place the body of the comment in the body textarea
                $("#bodyinput").val(data.comment.body);
            }
        });
});

// When you click the savecomment button
$(document).on("click", "#savecomment", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the comment, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from comment textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the comments section
            $("#comments").empty();
        });

    // Also, remove the values entered in the input and textarea for comment entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

$(document).on("click", "#deletecomment", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/deleteComment/" + thisId
    })
        .then(function () {
            $("#comments").empty();
        });

});

