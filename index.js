const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];

let filteredMovies = [];
let page = 1; //新增變數:以利後續儲存當前頁碼

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const displayModeSwitch = document.querySelector("#display-mode-switch");

//新增函式：以清單模式顯示
function renderMovieListListMode(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // title, id 隨著每個 item 改變
    rawHTML += `<ul class="list-group">`;
    rawHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div class="ms-2 me-auto">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="list-buttons">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id="${item.id} ">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
    `;
    rawHTML += `</ul>`;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderMovieList(data) {
  // 新增條件判斷：若list mode被啟動則呼叫 renderMovieListListMode 直接改用清單模式render
  if (displayModeSwitch.matches(".list-mode-activated")) {
    renderMovieListListMode(data);
  }
  //若list mode未被啟動，則以預設的卡片模式render
  else {
    let rawHTML = "";

    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id
        } ">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
        }">+</button>
            </div>
          </div>
        </div>
      </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios
    .get(INDEX_URL + id)
    .then((res) => {
      const data = res.data.results;
      modalTitle.innerText = data.title;
      modalDate.innerText = "Release date: " + data.release_date;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image
        }" alt="movie-poster" class="img-fluid">`;
    })
    .catch((err) => console.log(err));
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const favoriteMovie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已在收藏清單中！");
  }
  list.push(favoriteMovie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 新增切換按鈕
displayModeSwitch.addEventListener("click", function onSwitchClicked(event) {
  // 若點擊到清單模式鈕
  if (event.target.matches("#btn-list-mode")) {
    //啟動清單模式，儲存在 displayModeSwitch 元素的屬性裡
    this.className = "list-mode-activated";
    //呼叫 renderMovieListListMode：以清單模式render畫面
    renderMovieListListMode(getMoviesByPage(page));
  }
  // 若點擊到卡片模式鈕
  else if (event.target.matches("#btn-card-mode")) {
    //若清單模式已被啟動則將之取消
    if (this.matches(".list-mode-activated")) {
      this.classList.remove("list-mode-activated");
    }
    //呼叫函式render畫面
    renderMovieList(getMoviesByPage(page));
  }
});

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  page = 1;

  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1));
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));
