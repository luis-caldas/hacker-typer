/*
 * Original work Copyright (c) 2011 Simone Masiero
 * Modified work Copyright 2018 Luis Caldas
 * This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 License
 */

"use strict";

$(function() {
    $(document).keydown(function(event) {
        Typer.addText(event); // capture the keydown event and call the addText, this is executed on page load
    });
});

var Typer = {

    text: null,
    index: 0, // current cursor position
    speed: 2, // speed of the Typer
    file: "", // file, must be setted
    cursorChar: "█", // necessarily 1 char long
    numberOfPresses: 3, // number of keypresses needed for a popup to pop

    // popups data
    popups: {
        "access": {
            "count": 0,
            "id": "gran",
            "text": "access granted",
            "css": {
                "background": "#333",
                "border-color": "#999"
            },
            "keycode": 18
        },
        "denied": {
            "count": 0,
            "id": "deni",
            "text": "access denied",
            "css": {
                "color": "#F00",
                "background": "#511",
                "border-color": "#F00"
            },
            "keycode": 20
        }
    },

    init: function() { // inizialize Hacker Typer
        setInterval(function() { Typer.updLstChr(); }, 500); // inizialize timer for blinking cursor
        $.get(Typer.file, function(data) { // get the text file
            Typer.text = data; // save the textfile in Typer.text
        });
    },

    content: function() {
        return $("#console").html(); // get console content
    },

    write: function(str) { // append to console content
        $("#console").append(str);
        return false;
    },

    createPopupDiv: function(idname, text, css) {

        // create empty div with the given id name
        var tempDiv = $("<div id=\"" + idname + "\"></div>");

        // add classes
        tempDiv.addClass("popup");

        // add custom css
        tempDiv.css(css);

        // set content of div
        tempDiv.html("<h1>" + text + "</h1>");

        return tempDiv;
    },

    makePopup: function(popupData) {
        Typer.removePop();
        Typer.accessCount = 0;
        var ddiv = Typer.createPopupDiv(
            popupData["id"],
            popupData["text"],
            popupData["css"]
        );
        $(document.body).prepend(ddiv); // prepend div to body
    },

    removePop: function() { // remove all existing popups
        for(let i = 0; i < Object.keys(Typer.popups).length; ++i)
            $("#" + Typer.popups[Object.keys(Typer.popups)[i]]["id"]).remove();
    },

    clearAllButPopupCounters: function(indexJump) {
        for(let i = 0; i < Object.keys(Typer.popups).length; ++i)
            if (i != indexJump)
                Typer.popups[Object.keys(Typer.popups)[i]]["count"] = 0;
    },

    addText: function(key) { // main function to add the code

        // iterate the popups
        for(let i = 0; i < Object.keys(Typer.popups).length; ++i) {

            if (key.keyCode === Typer.popups[Object.keys(Typer.popups)[i]]["keycode"]) {

                // clear all other counters
                Typer.clearAllButPopupCounters(i);

                // add a keypress
                ++Typer.popups[Object.keys(Typer.popups)[i]]["count"];

                // check of a certain number of key presses and make the popup
                if (Typer.popups[Object.keys(Typer.popups)[i]]["count"] >= Typer.numberOfPresses)
                    Typer.makePopup(Typer.popups[Object.keys(Typer.popups)[i]]);

                return;
            }

        }

        // key 27 = esc key
        if (key.keyCode == 27) {

            // remove all popups
            Typer.removePop();

        } else if (Typer.text) { // otherway if text is loaded

            var cont = Typer.content(); // get the console content

            if (cont.substring(cont.length - 1, cont.length) == Typer.cursorChar) // if the last char is the blinking cursor
                $("#console").html($("#console").html().substring(0, cont.length - 1)); // remove it before adding the text

            if (key.keyCode != 8) { // if key is not backspace
                Typer.index += Typer.speed;    // add to the index the speed
            } else {
                if (Typer.index > 0) // else if index is not less than 0
                    Typer.index -= Typer.speed; // remove speed for deleting text
            }

            var text = $("<div/>").text(Typer.text.substring(0, Typer.index)).html(); // parse the text for stripping html enities
            var rtn = new RegExp("\n", "g"); // newline regex
            var rts = new RegExp("\\s", "g"); // whitespace regex
            var rtt = new RegExp("\\t", "g"); // tab regex
            $("#console").html(
                text.replace(rtn, "<br/>").replace(rtt, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts, "&nbsp;")
            ); // replace newline chars with br, tabs with 4 space and blanks with an html blank

            window.scrollBy(0, 50); // scroll to make sure bottom is always visible
        }
        if(key.preventDefault && key.keyCode != 122 ){ // prevent F11(fullscreen) from being blocked
            key.preventDefault();
        }
        if(key.keyCode != 122) { // otherway prevent keys default behavior
            key.returnValue = false;
        }
    },

    updLstChr: function() { // blinking cursor
        var cont = this.content(); // get console
        if(cont.substring(cont.length - 1, cont.length) == Typer.cursorChar) // if last char is the cursor
            $("#console").html($("#console").html().substring(0, cont.length - 1)); // remove it
        else
            this.write(Typer.cursorChar); // else write it
    }
}
