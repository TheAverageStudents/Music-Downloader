console.log("Hello World!")
/*
    Functions
*/
function loaded(){
    var loader = document.getElementById("BeginningLoader")
    loader.setAttribute("loaded", true)
    loader.style.animationPlayState = "paused"
    document.getElementById("Page").setAttribute("active", true)
    document.getElementById("Page").hidden = false
}

function error(text){
    errorLabel.innerHTML = text
}

function selectedOption(type, param){
    var Sec1 = document.getElementById("Sec1")
    Sec1.hidden = true
    var Sec2 = document.getElementById("Sec2")
    Sec2.style.visibility = "visible"
    Sec2.setAttribute("active", true)
    Sec2.hidden = false
    if(type == "spotify"){
        ConditionalText1.innerHTML = "Pass in the URL of the song or playlist:"
        QueryInput.setAttribute("type", "spotify")
        content_type.setAttribute("value", "spotify")
        content_param.setAttribute("value", param)
    }
    else if(type == "youtube"){
        ConditionalText1.innerHTML = "Enter the URL of the video:"
        QueryInput.setAttribute("type", "youtube")
        content_type.setAttribute("value", "youtube")
        content_param.setAttribute("value", param)
    }
    else if(type == "search"){
        ConditionalText1.innerHTML = "Enter your search term:"
        QueryInput.setAttribute("type", "search")
        content_type.setAttribute("value", "search")
        content_param.setAttribute("value", param)
    }
    else{ConditionalText1.innerHTML = "You inspected..."}
    QueryInput.focus()
    console.log(content_type.value)
}

async function getContentIdSpotify(url){
    var ok = false
    url = String(url)
    if(url.includes("spotify.com/track/")){
        content_param.setAttribute("value", "track")
        url = url.split("spotify.com/track/")[1]
        if(url.includes("?")){url = url.split("?")[0]}
        ok = true
        var a = await(await fetch(`/stats?type=spotify&q=${url}&param=track`)).json()
        statsLabel.innerHTML = String("~ " + Math.round(a) + " minutes")
        error(null)
    }
    else if(url.includes("spotify.com/playlist/")){
        content_param.setAttribute("value", "playlist")
        url = url.split("spotify.com/playlist/")[1]
        if(url.includes("?")){url = url.split("?")[0]}
        ok = true
        var a = await(await fetch(`/stats?type=spotify&q=${url}&param=playlist`)).json()
        statsLabel.innerHTML = String("~ " + Math.round(a) + " minutes")
        error(null)
        if(a > 200){error("Limit is 200 minutes."); submit.disabled = true}
    }
    else{error("Not a valid link.")}
    content_query.setAttribute("value", url)
    return ok
}

function getContentIdYoutube(url) {
    var ok = false
    url = String(url)
    if(url.includes("youtube.com/watch?v=")){
        url = url.split("youtube.com/watch?v=")[1]
        if(url.length >= 1){
            content_param.setAttribute("value", "video")
            ok = true
            error(null)
            video.hidden = false
            document.getElementById("text1").hidden = false
        }
        else{error("URL does not include a video/playlist id!")}
    }
    else if(url.includes("youtube.com/playlist?list=")){
        url = url.split("youtube.com/playlist?list=")[1]
        if(url.length >= 1){
            content_param.setAttribute("value", "playlist")
            ok = true
            error(null)
            video.hidden = true
            document.getElementById("text1").hidden = true
        }
        else{error("URL does not include a video/playlist id!")}
    }
    else{
        error("Inavlid url."); ok = false;
        video.hidden = true
        document.getElementById("text1").hidden = true
    }
    if(url.includes("?")){
        url = url.split("?")[0]
    }
    content_query.setAttribute("value", url)
    return ok
}

async function downloadFromSearch(id){
    content_type.setAttribute("value", "youtube")
    content_param.setAttribute("value", "video")
    content_query.setAttribute("value", id)
    form.submit()
    form.innerHTML = `Your request is being processed and could take upto 5 minutes.<br/>
                Your download will start automatically once all the audio is collected.<br/>
                Meanwhile, a random fact: ${await(await fetch("/randomFact")).text()}
    `
    document.getElementById("result").innerHTML = ""
}

async function searchQuery(query){
    submit.disabled = true
    var results = await(await fetch(`/search?q=${query}`)).json()
    var table = document.createElement("table")
    table.id = "result"
    table.innerHTML += `
        <tr>
            <td><b>Sl.no.</b></td>
            <td><b>title</b></td>
            <td><b>duration</b></td>
            <td><b>views</b></td>
            <td>-</td>
        </tr>
        `
    var j = 0
    for(var i of results){
        j++
        table.innerHTML += `
        <tr>
            <td>${j}</td>
            <td>${i.title}</td>
            <td>${i.duration_raw}</td>
            <td>${i.views}</td>
            <td onclick="downloadFromSearch('${i.id.videoId}')" class="searchDownload"><u>Download</u></td>
        </tr>
        `
    }
    if(document.getElementById("result")){
        document.getElementById("result").innerHTML = table.innerHTML
    }else{
        document.getElementById("QueryArea").insertAdjacentElement("beforeend", table)
    }
    document.getElementById("HeadingText").style.fontSize = "5vh"
    document.getElementById("coverup").style.height = "8vh"
    ConditionalText1.parentNode.removeChild(ConditionalText1.parentElement.firstElementChild)
    ConditionalText1.parentNode.removeChild(ConditionalText1)
    formDiv.style.marginTop = "-15vh"
}

function checkText(text){
    var content =  String(text)
    while(content.includes(" ")){content = content.replace(" ", "")}
    while(content.includes("    ")){content = content.replace(" ", "")}
    if(content == ""){return false}else{return true}
}

/*
    Code
*/

var spotify = document.getElementById("Spotify")
var youtube = document.getElementById("Youtube")
var search = document.getElementById("Search")
var form = document.getElementById("form")
var formDiv = document.getElementById("FormDiv")
var QueryInput = document.getElementById("QueryInput")
var ConditionalText1 = document.getElementById("ConditionalText1")
var statsLabel = document.getElementById("stats")
var video = document.getElementById("video")
var content_query = document.getElementById("content_query")
var content_type = document.getElementById("content_type")
var content_param = document.getElementById("content_param")
var submit = document.getElementById("Submit")
var errorLabel = document.getElementById("error")


spotify.addEventListener("click", ()=>{
    selectedOption("spotify")
})

youtube.addEventListener("click", ()=>{
    selectedOption("youtube", null)
})

search.addEventListener("click", ()=>{
    selectedOption("search", null)
})

QueryInput.addEventListener("input", ()=>{
    if(checkText(QueryInput.value) == true){
        submit.disabled = false
        if(content_type.getAttribute("value") == "spotify"){
            getContentIdSpotify(QueryInput.value)
        }else if(content_type.getAttribute("value") == "youtube"){
            getContentIdYoutube(QueryInput.value)
        }
        else if(content_type.getAttribute("value") == "search"){
            submit.disabled = false
        }
        else{submit.disabled = true}
    }else{submit.disabled = true}
})

form.addEventListener("submit", (e)=>{
    e.preventDefault()
})


submit.addEventListener("click", async ()=>{
    if(content_type.getAttribute("value") == "spotify"){
        form.submit()
        form.innerHTML = `Your request is being processed and could take upto 5 minutes.<br/>
            Your download will start automatically once all the audio is collected.<br/>
            Meanwhile, a random fact: ${await(await fetch("/randomFact")).text()}
        `
    }
    else if(content_type.getAttribute("value") == "youtube"){
        form.submit()
        form.innerHTML = `Your request is being processed and could take upto 5 minutes.<br/>
            Your download will start automatically once all the audio is collected.<br/>
            Meanwhile, a random fact: ${await(await fetch("/randomFact")).text()}
        `
    }
    else if(content_type.getAttribute("value") == "search"){
        searchQuery(QueryInput.value)
    }
    else{console.log(content_type.getAttribute("value"))}
})

/*
    Adjust according to device.
*/

var style = document.createElement("link")
style.rel = "stylesheet"
style.href = "../Styles/computer.css"
document.getElementById("scripts").insertAdjacentElement("beforeend", style)
style.addEventListener("load", ()=>{
    loaded()
})
