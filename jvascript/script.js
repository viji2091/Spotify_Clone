let currentSong = new Audio;
let songs;
let currFolder;
let userHasInteracted = false; // To track if the user has interacted


function formatTime(totalSeconds) {
    // Calculate minutes and remaining seconds
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00"
    }
    const seconds = Math.floor(totalSeconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad the minutes and seconds with leading zeros if needed
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time string
    return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let songUrl = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await songUrl.text()
    let songEle = document.createElement("div")
    songEle.innerHTML = response;
    songs = []
    let as = songEle.getElementsByTagName("a")

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/128-`)[1])
        }
    }

    
    //Show all the songs in the playlist
    let uls = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    uls.innerHTML = ""
    //Show all the songs in playlist
    for (const song of songs) {
        uls.innerHTML = uls.innerHTML + `
        <li class="flex rounded ">
            <img  class ="invert" src="./assets/music.svg" alt="" srcset="">
            <div class="song-info"> 
                <div>${song.replaceAll("%20", " ").split("-")[0]}</div >
                <div>${song.replaceAll("%20", " ").split("-")[1].split("128")[0]}</div>
            </div>                                
        </li>`
    }

    
//     <div class="play1 flex items-center g-5">
//     <span class="flex items-center">Play Now</span>
//     <img class="invert" src="./assets/play.svg" alt="" srcset="">
//     </div>           

    // Attach an even listener to each song
    
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", (ele) => {
            let track = element.querySelector(".song-info > div:first-child").textContent
            let track1 = element.querySelector(".song-info > div:nth-child(2)").textContent
            playMusic(track + "-" + track1 + "128 " + "Kbps.mp3")
        })
    });

    if (userHasInteracted) {
        playMusic(songs[0], true); // Auto-play if the user has already interacted
    }

}

const playMusic = (track, isFirst = false) => {
    currentSong.src = `/${currFolder}/128-` + track
    if (!isFirst) {
        play.src = "./assets/pause.svg"
        currentSong.play();
    }
    document.querySelector(".song-name").innerHTML = decodeURI(track).split("-")[0]
    document.querySelector(".song-duration").innerHTML = "00:00 /  00: 00"

}


async function displayAlbums() {
    let folderUrl = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await folderUrl.text();
    let albumEle = document.createElement("div")
    albumEle.innerHTML = response;
    let as = albumEle.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    console.log(cardContainer);
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes('/song') && !element.href.includes(".htaccess")) {
            let folder = element.href.split("/").slice(-2)[0]
            let folderJson = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await folderJson.json();
            cardContainer.innerHTML =cardContainer.innerHTML +`<div class="card border rounded" 
            data-folder="${folder}" >
                <div class="img">
                    <img class="rounded" src="/songs/${folder}/cover.jpeg"
                                alt="">
                    <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                fill="none">
                        <circle cx="12" cy="12" r="10" fill="#1fdf64" />
                        <path d="M9 7L16 12L9 17V7Z" fill="black" />
                    </svg>
                </div>
                    <h2>${response.title}</h2>
                    <p>${response.Description}</p>
            </div>`
        }
    }

    //Load the plylist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(element => {
        element.addEventListener("click", async (item) => {
            getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    });
}
async function main() {


    document.body.addEventListener('click', () => {
        userHasInteracted = true; // Mark user interaction
    });

    //Get the list of all songs displayed in a proper format
    await getSongs("songs/Hindi")
    playMusic(songs[0], true)

    //Display all the albums in the page
    displayAlbums()

    // Attach an even listener to play , pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./assets/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "./assets/play.svg"
        }
    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-duration").innerHTML =
            `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add an event listener to seekbar
    document.querySelector(".seek-bar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent * (currentSong.duration)) / 100
    })

    //add an event listener for hambuger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    //add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    })

    //add an event listener for previous  
    previous.addEventListener("click", () => {
        currentSong.pause();
        let ind = songs.indexOf(currentSong.src.split("128-").slice(-1)[0])
        playMusic(songs[(ind - 1 + songs.length) % songs.length])
    })

    //add an event listener for next  
    next.addEventListener("click", () => {
        currentSong.pause();
        let ind = songs.indexOf(currentSong.src.split("128-").slice(-1)[0])
        playMusic(songs[(ind + 1) % songs.length])
    })

    //add an event for volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume == 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume","mute")
        }
        else
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute","volume")

    })

    //add an event of volume and mute 
    document.querySelector(".volume>img").addEventListener("click",(ele) =>{
        if(ele.target.src.includes("volume")){
            ele.target.src = ele.target.src.replace("volume","mute")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            ele.target.src = ele.target.src.replace("mute","volume")
            currentSong.volume = .1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
    

}
main()