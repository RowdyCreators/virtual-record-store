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
const searchButton = document.getElementById("searchButton");

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

  //searchElements.foreach(e)s => {

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
