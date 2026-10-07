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
  }
  IFrameAPI.createController(element, options, callback);
  
};

const searchBar = document.getElementById("searchBar");
const searchElements = document.getElementById('e');
const searchButton = document.querySelectorAll("searchButton");

function search() {
  const searchString = searchBar.value;
  console.log(searchString);
  if (searchString === "hi") {
    console.log("success");
  }

  //searchElements.foreach(e) => {

  console.log("Searched");
}

searchBar.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    search();
  }
}
)