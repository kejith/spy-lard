// ==UserScript==
// @name         Spylard
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author       kejith
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pr0game.com
// @grant        none
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements */

function removeNewlinesAndTabs(input) {
    if (typeof input === 'string' || input instanceof String)
        return input.replace(/[\r\n\t]/g, "");

    return "";
}

function basename(path) {
    if (path == undefined)
        return ""

    return path.split('/').reverse()[0];
}


function sendSystem(data) {
    const parameters = {
        url: "http://localhost:3000/galaxy/system/update",
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: 'POST',
        success: (data, status, xhr) => {
            console.log("success")
            $('input#update-system').prop('value', "UPDATED SUCCESSFULLY")
            $('input#update-system').prop('disabled', true)
        },
        error: (jqxhr, status, error) => {
            console.log(error)
            $('input#update-system').prop('value', "UPDATE FAILED")
            $('input#update-system').prop('disabled', false)
        }
    }
    
    $('input#update-system').prop('value', "UPDATING...")
    
    var jqxhr = $.ajax(parameters)
    
        setTimeout(function() {
            $('input#update-system').prop('value', "Update")
        }, 5000);
}


const System_Position = 0
const System_Avatar = 1
const System_Name = 2
const System_Moon = 3
const System_Debris = 4
const System_User = 5
const System_Alliance = 6


function updateSystem() {
    var system = {
        galaxy: 0,
        system: 0,
        planets: new Array()
    }

    system.galaxy = parseInt( $('#galaxy_form input[name="galaxy"]').val() );
    system.system = parseInt( $('#galaxy_form input[name="system"]').val() );

    $('.table569 > tbody > tr').each(function (rowIndex, value) {

        let planet = {
            position: 0,
            avatar: 0,
            name: "",
            moon: false,
            debris: {
                metal: 0,
                crystal: 0,
            },
            user: "",
            alliance: "",
            inactive: 0,
            umode: false,
        };


        $(this).children("td").each(function (columnID, valueCol) {
            switch (columnID) {
                case System_Position:
                    planet.position = parseInt(removeNewlinesAndTabs($(this).text()));
                    break;

                case System_Avatar:
                    planet.avatar = basename($(this).find("img").attr('src'));
                    break;

                case System_Name:
                    planet.name = removeNewlinesAndTabs($(this).text());
                    break;

                case System_Moon:
                    // true if .tooltip_sticky class can be found on this cell
                    // false otherwise
                    planet.moon = $(this).find(".tooltip_sticky").attr("data-tooltip-content") != undefined;
                    break;

                case System_Debris:
                    planet.debris.metal = 0;
                    planet.debris.crystal = 0;
                    //console.log($(this).html())
                    break;

                case System_User:
                    var user = removeNewlinesAndTabs($(this).text());
                    const regExp = /\(([^)]+)\)/;
                    const regExpUserID = /\(([^)]+)\)/;
                    var matches = regExp.exec(user);

                    var tooltipHTML = $(this).find(".tooltip_sticky").attr("data-tooltip-content")
                    var userIDMatches = regExpUserID.exec(tooltipHTML)

                    if (userIDMatches) {
                        planet.userID = parseInt(userIDMatches[1])
                    }

                    if (matches) {
                        // remove user details from username string
                        user = user.replace(matches[0], "")
                        
                        
                        info = matches[1]
                        if (info.indexOf("i") != -1)
                            planet.inactive += 1
                            
                            if (info.indexOf("I") != -1)
                            planet.inactive += 1
                            
                            planet.umode = info.indexOf("u") != -1
                            
                    }
                        
                    planet.user = user
                    break;

                case System_Alliance:
                    planet.alliance = removeNewlinesAndTabs($(this).text());
                    break;


                default:
                    break;
            }
        });

        if (planet.name != '') {
            system.planets.push(planet)
        }
    })

    sendSystem(system);

    console.log(`${system.planets.length} Planets found.`);
    console.log(system)
}

// -----------
// Search Colonies


(function () {
    'use strict';

    // Add Button to top of System
    $('#galaxy_form > table > tbody').append(`
      <td style="background-color:transparent;border:0px;" colspan="2">
	    <input type="button" value="Update" id="update-system" />
	  </td>`);
    $('#update-system').click(updateSystem);

    $('body > div.wrapper').append(`
        <div class="no-mobile" style="padding: 10px; margin-right: 10px; grid-area: 2 / 5 / auto / auto; overflow-x: hidden; width: 20vw;">
            <div id="colony-search-wrapper">
                <form id="search-colonies">
                    <table >
                        <tr><th style="text-align: center">Spieler suche</th></tr>
                        <tr><td style="text-align: center"><input id="search-colony-input-user" type="text"></td></tr>
                        <tr><td style="text-align: center"><input id="search-colony-btn" type="button" value="Suchen"></td></tr>
                    </table>
                </form>
            </div>
            <div id="colony-search-results-wrapper">
                <table>
                </table>
            </div>
        </div>
    `)

    document.getElementById("search-colony-btn").addEventListener("click", function (event) {
        event.preventDefault();
        var inputUser = $("#search-colony-input-user").val()
        $.get(`http://localhost:3000/galaxy/system/planets?user=${inputUser}`, (data) => {
            $("#colony-search-results-wrapper > table").html("")

            console.log(data)
            data[0].planets.forEach((element) => {
                $("#colony-search-results-wrapper > table").append(`
                    <tr>
                        <td>${element.galaxy}:${element.system}:${element.position}</td>
                        <td>${element.name}</td>
                    </tr>
                `)
            })
        })
    });    

})();
