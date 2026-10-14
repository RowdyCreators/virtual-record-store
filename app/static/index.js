const searchBar = document.querySelector("#searchBar");

if (searchBar) {
  searchBar.addEventListener("input", () => {
    searchBar.dispatchEvent(new CustomEvent("search", { bubbles: true }));
  });
}
