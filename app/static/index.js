let spotifyController = null;

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  const element = document.getElementById("embed-iframe");
  const options = {
    uri: 'spotify:episode:7makk4oTQel546B0PZlDM5'
  }
  const callback = (EmbedController) => {
  document.querySelectorAll('.episode').forEach(
    episode => {
      episode.addEventListener('click', () => {
        EmbedController.loadEntity(episode.dataset.spotifyId)
      });
    })

    spotifyController = EmbedController;
  }
  IFrameAPI.createController(element, options, callback);
  
};

const searchBar = document.getElementById("searchBar");
const searchButton = document.getElementById("searchButton");
const createNewEmbedButton = document.getElementById('create-new-embed');

/**
 * Gets the string from the searchbar and searches the database using it.
 * @param {string} searchString - The text to search by. 
 */
function search(searchString) {
  console.log(searchString);
  if (searchString === "hi") {
    console.log("success");
  } else if (searchString.length < 1) {
    console.log("An <Empty String> was entered");
  }

  console.log("Searched");
}

/*
searchBar.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    e.preventDefault();
    const searchString = searchBar.value;

    search(searchString);
    searchBar.value = "";
  }
})
  */

searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  const searchString = searchBar.value;

  search(searchString.trim());
  searchBar.value = "";
})

createNewEmbedButton.addEventListener("click", (e) => {
  e.preventDefault();
  
  const CardData = [0, "Pop", "A Really Cool Song", "The SongMaker", "test/image/url.png", " ","https://open.spotify.com/track/574y1r7o2tRA009FW0LE7v?si=537b25c846994003"];
  createCard(CardData);
})

function createCard(cardData) {
  /*
   * cardData array: {id, type, title, artist, image_url, spotify_url}
   * 
   * Currently using the spotify url to get the embed and display it.
   * Potential feat: Make custom cards and stylize it to fit the theme of the app.
   * 
  */
 
  if (cardData instanceof Array && cardData.length === 7) {
    const [id, type, title, artist, image_url, arr_spot_uri, spotify_url] = cardData;

    const spotify_uri = convertToUri(spotify_url); //converts the spotify url to a uri (OPTIONAL)

    const newEmbedButton = document.createElement('button');
    newEmbedButton.innerText = title;
    newEmbedButton.className = "episode";
    newEmbedButton.dataset.spotifyId = spotify_uri;
    newEmbedButton.addEventListener("click", (event) => {
      event.preventDefault();
      spotifyController.loadEntity(event.currentTarget.dataset.spotifyId);
      console.log("Episode Loaded!");
    })

    const episodes = Array.from(document.getElementsByClassName('episodes'));
    episodes.forEach((element) => {
      element.appendChild(newEmbedButton);
    })
  } else {
    console.log("Error: Card Data incorrect");
  }
}

function convertToUri(link) {
  const link_elements = link.trim().split(/\//);
  const trackingReg = /\?{si\=*$|sl\=*$}/;
  let spotify_uri = null;

  if (link_elements[0] === "https:") {
    link_elements[0] = ""; link_elements[2] = "spotify";

    if (link_elements[4].slice(trackingReg)) {
      const link_seperated_tracking = link_elements[4].split(trackingReg);
      link_elements[4] = link_seperated_tracking[0];
    }

    spotify_uri = link_elements.join(":");
    spotify_uri = spotify_uri.substring(2); //Gets rid of leading colons

  } else if (link_elements[0] === "open.spotify.com") {
    link_elements[0] = "spotify";
    
    spotify_uri = link_elements.join(":");
  }
  
  
  return spotify_uri;
}
