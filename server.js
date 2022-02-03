const server = require("express")()
const fs = require("fs")
const ytdl = require("ytdl-core")
const ytpl = require("ytpl")
const ytSearch = require("youtube-search-without-api-key")
const spotifyApi = require("spotify-web-api-node")
const r = require("request-promise")
const zipper = require("zip-local")
const path = require("path")
const parser = require("body-parser").urlencoded({extended : false})

var spotify = new spotifyApi({
    clientId : "714dc4b9b4354f97982be83b2b76b4d5",
    clientSecret : "4d1f590c40d043329305965fb7c40d49",
    redirectUri : "https://feedback.gigipopi.repl.co",
    accessToken : "BQDp5sUhR1bJ-wM8KsY2lk_Qr-7_M4fGyCKctnaaNuU-udkFqoxfd9nwsTNkvO0tcmugtBO8dalvHSuSqNl_Ezfq7MXPt8HIDSA4m10AZfBgb_bdYOySTd59EijT95aKP8fQuX6k3qonJeK4MaPi6IebXrcscRw"
})

function generateID() {
    var alphabets = [null, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
    var ID = ""
    for(var i of alphabets){
        ID += alphabets[parseInt(Math.floor(Math.random() * 10))]
    }
    return ID
}

/*
    Website
*/

server.all("/", (req, res)=>{
    res.send(fs.readFileSync("Website/index.html").toString())
})

server.all("/Website/*", (req, res)=>{
    var url = req.url.split("/")[req.url.split("/").length - 1]
    url = decodeURI(url)
    res.sendFile(path.join(__dirname + `/Website/${url}`))
})

server.all("/Styles/*", (req, res)=>{
    var url = req.url.split("/")[req.url.split("/").length - 1]
    url = decodeURI(url)
    res.sendFile(path.join(__dirname + `/Styles/${url}`))
})

server.all("/Scripts/*", (req, res)=>{
    var url = req.url.split("/")[req.url.split("/").length - 1]
    url = decodeURI(url)
    res.setHeader("content-type", "text/css")
    res.sendFile(path.join(__dirname + `/Scripts/${url}`))
})

server.all("/Resources/*", (req, res)=>{
    var url = req.url.split("/")[req.url.split("/").length - 1]
    url = decodeURI(url)
    res.sendFile(path.join(__dirname + `/Resources/${url}`))
})

server.all("/Fonts/*", (req, res)=>{
    var url = req.url.split("/")[req.url.split("/").length - 1]
    url = decodeURI(url)
    res.sendFile(path.join(__dirname + `/Fonts/${url}`))
})


/*
    Server
*/


server.all("/stats", parser, (req, res)=>{
    var type, song, param
    if(req.query.type){var type = req.query.type}else{var type = "null"}
    if(req.query.q){var song = req.query.q}
    if(req.query.param){var param = req.query.param}else{var param = "null"}
    console.log(String(song + " , " + type))

    if(type == "null" || type == "youtube"){}
    else if(type == "spotify"){
        if(param == "track"){
            r(`https://sp.gigipopi.repl.co/t?i=${song}`, {json : true}).then((track)=>{
                res.send(String(track.duration_ms/60000).substring(0, 5))
            })
        }else if(param == "playlist"){
            r(`https://sp.gigipopi.repl.co/p?i=${song}`, {json : true}).then((playlist)=>{
                var total_duration = 0
                var max_duration = 5130000
                for(var j of playlist.tracks.items){
                    total_duration += j.track.duration_ms/60000
                }
                res.send(String(total_duration))
            })
        }
    }
})

server.all("/download", parser, (req, res)=>{
    var type, song, param, video
    if(req.body.type){var type = req.body.type}else{var type = "null"}
    if(req.body.q){var song = req.body.q}
    if(req.body.param){var param = req.body.param}else{var param = "null"}
    if(req.body.video){var video = req.body.video}else{var video = "null"}
    console.log(String(song + " , " + type + " , " + param))

    function cleanse(string){
        string = string.replace(/['"|%{}/\\?%*:|"<>#+=^$!@&]/g, " ")
        return string
    }
    async function downloadSong(song){
        ytSearch.search(String(song)).then((results)=>{
            console.log(results[0].url)
            var song_url = results[0].url
            ytdl.getInfo(String(song_url)).then((info)=>{
                ytdl.downloadFromInfo(info, {filter : "audioonly", quality : "highestaudio"})
                .pipe(fs.createWriteStream(`${song}.mp3`).on("close", ()=>{
                    console.log("Downloaded");
                    console.log(path.join(__dirname + `/${song}.mp3`));
                    res.redirect(`/storage/${song}.mp3`)
                    setTimeout(()=>{
                        try{
                            fs.unlinkSync(`${song}.mp3`, "")
                        }catch(err){}
                    }, 180000)
                }))
            })
        })
    }
    async function downloadPlaylistSong(song, song_count, id){
        setTimeout(() => {
            res.redirect("/website/error.html")
            setTimeout(()=>{
                try{
                    fs.rm("./Playlist", {recursive : true})
                    fs.mkdirSync("./Playlist")
                }catch(e){}
            }, 3000)
        }, 180000);
        ytSearch.search(String(song)).then((results)=>{
            console.log(results[0].url)
            var song_url = results[0].url
            ytdl.getInfo(String(song_url)).then((info)=>{
                ytdl.downloadFromInfo(info, {filter : "audioonly", quality : "highestaudio"})
                .pipe(fs.createWriteStream(`Playlist/${song}.mp3`).on("close", ()=>{
                    var current_progress = fs.readFileSync("temp.json")
                    var content = JSON.parse(String(current_progress))
                    var progress = content.Completed
                    //progress++
                    content.Completed++
                    console.log(`${progress}. ${content.Completed}`);
                    fs.writeFileSync("temp.json", JSON.stringify(content))
                    if(content.Songs == content.Completed){
                        //Start zipping
                        zipper.sync.zip("./Playlist").save("p.zip")
                        res.redirect(`/storage/p.zip`)
                        setTimeout(()=>{
                            try{
                                fs.unlinkSync("p.zip")
                                //use fs.rmdir below because replit has an old version of node.js.
                                fs.rm("./Playlist/", {recursive : true}, (err)=>{
                                    console.log(err)
                                    fs.mkdirSync("./Playlist")
                                })
                            }catch(e){}
                        }, 180000)
                    }
                }))
            })
        })
    }
    async function downloadFromYt(song_url, type, quality){
        ytdl.getInfo(String("https://youtube.com/watch?v=" + song_url)).then((info)=>{
            ytdl.downloadFromInfo(info, {filter : `${type}`, quality : `${quality}`})
            .pipe(fs.createWriteStream(`${cleanse(info.videoDetails.title)}.mp3`).on("close", ()=>{
                console.log("Downloaded");
                console.log(path.join(__dirname + `/${cleanse(info.videoDetails.title)}.mp3`));
                res.redirect(`/storage/${cleanse(info.videoDetails.title)}.mp3`)
                setTimeout(()=>{
                    try{
                        fs.unlinkSync(`${cleanse(info.videoDetails.title)}.mp3`, "")
                    }catch(err){}
                }, 180000)
            }))
        })
    }
    async function downloadPlaylistFromYt(song_url, type, quality){
        setTimeout(() => {
            res.redirect("/website/error.html")
            setTimeout(()=>{
                try{
                    fs.rm("./Playlist", {recursive : true})
                    fs.mkdirSync("./Playlist")
                }catch(e){}
            }, 3000)
        }, 180000);
        ytdl.getInfo(song_url).then((info)=>{
            ytdl.downloadFromInfo(info, {filter : `${type}`, quality : `${quality}`})
            .pipe(fs.createWriteStream(`Playlist/${cleanse(info.videoDetails.title)}.mp3`).on("close", ()=>{
                var current_progress = fs.readFileSync("temp.json")
                var content = JSON.parse(String(current_progress))
                var progress = content.Completed
                //progress++
                content.Completed++
                console.log(`${progress}. ${content.Completed}`);
                fs.writeFileSync("temp.json", JSON.stringify(content))
                if(content.Songs == content.Completed){
                    //Start zipping
                    zipper.sync.zip("./Playlist").save("p.zip")
                    res.redirect(`/storage/p.zip`)
                    setTimeout(()=>{
                        try{
                            fs.unlinkSync("p.zip")
                            //use fs.rmdir below because replit has an old version of node.js.
                            fs.rm("./Playlist/", {recursive : true}, (err)=>{
                                console.log(err)
                                fs.mkdirSync("./Playlist")
                            })
                        }catch(e){}
                    }, 180000)
                }
            }))
        })
    }

    if(type == "null"){
        downloadSong(song)
    }
    else if(type == "youtube"){
        if(param == "video"){
            if(video == "on"){
                downloadFromYt(song, "audioandvideo", "highest")
            }
            else{downloadFromYt(song, "audioonly", "highestaudio")}
        }
        else if(param = "playlist"){
            ytpl(String(song), {limit : 100}).then((playlist)=>{
                var id = generateID()
                fs.writeFileSync("temp.json", JSON.stringify(
                    {
                        "ID" : id,
                        "Songs" : playlist.items.length,
                        "Completed" : 0
                    }
                ))
                if(video == "on"){
                    for(var i of playlist.items){
                        downloadPlaylistFromYt(i.shortUrl, "audioandvideo", "highest")
                    }
                }
                else{
                    for(var i of playlist.items){
                        downloadPlaylistFromYt(i.shortUrl, "audioonly", "highestaudio")
                    }
                }
            })
        }
    }
    else if(type == "spotify"){
        if(param == "track"){
            r(`https://sp.gigipopi.repl.co/t?i=${song}`, {json : true}).then((track)=>{
                var song_name = String(track.name + " " + track.artist)
                song_name = cleanse(song_name)
                downloadSong(song_name)
            })
        }else if(param == "playlist"){
            r(`https://sp.gigipopi.repl.co/p?i=${song}`, {json : true}).then((playlist)=>{
                var id = generateID()
                fs.writeFileSync("temp.json", JSON.stringify(
                    {
                        "ID" : id,
                        "Songs" : playlist.tracks.items.length,
                        "Completed" : 0
                    }
                ))
                var total_duration = 0
                var max_duration = 12000000
                for(var j of playlist.tracks.items){
                    total_duration += j.track.duration_ms
                }
                console.log(total_duration)
                if(total_duration <= max_duration){
                    var song_count
                    for(var i of playlist.tracks.items){
                        var song_name = String(i.track.name + " " + i.track.artists[0].name)
                        song_name = cleanse(song_name)
                        var song_count = playlist.tracks.items.length
                        downloadPlaylistSong(song_name, song_count, id)
                    }
                }else{
                    console.log("Exceeded limit");
                    res.redirect("/website/error.html")
                }
            })
        }
    }
})

server.all("/storage/*", (req, res)=>{
    var url = req.url.split("/")[req.url.split("/").length - 1]
    url = decodeURI(url)
    console.log(url)
    res.download(path.join(__dirname + `/${url}`), function(err){
        console.log("Download complete")
        try{
            fs.unlinkSync(`${url}`)
            //use fs.rmdir below because replit has an old version of node.js.
            fs.rm("./Playlist/", {recursive : true}, (err)=>{
                console.log(err)
                fs.mkdirSync("./Playlist")
                fs.writeFileSync("p.zip", "")
            })
        }catch(e){}
    })
})


/**
 * Search service
 */

server.all("/search", (req, res)=>{
    var query = req.query.q
    ytSearch.search(query).then((results)=>{
        res.send(results)
    })
})

/**
 * Other stuff
 */

server.all("/randomFact", (req, res)=>{
    var a = parseInt(Math.random() * 1000)
    res.send(fs.readFileSync("Facts.txt").toString().split("\r,")[a])
    //res.send(process.env["facts"].toString().split("\n")[a])
})

server.all("*", (req, res)=>{
    res.sendStatus(404)
})

server.listen("1234", ()=>{console.log("Server is ready");})