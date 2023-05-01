const header = document.getElementsByTagName("header");
const select = document.getElementById("select");
const sortLevelBtn = document.getElementById("sort-level-btn");
const sortNameBtn = document.getElementById("sort-name-btn");
const sortNoneBtn = document.getElementById("sort-none-btn");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const digimonList = document.getElementById("digimon-list");
const paginationContainerT = document.getElementById("pagination-top");
const paginationContainerB = document.getElementById("pagination-bot");
const scrollTopBtn = document.getElementById("top-btn");
const scrollBotBtn = document.getElementById("bot-btn");
const reference = [
  "Fresh",
  "Training",
  "In Training",
  "Rookie",
  "Armor",
  "Champion",
  "Ultimate",
  "Mega",
];

let dataWithIndex = null;
let dataSearch = null;
let limit = select.value;
let sorted = "none";
let pageNum = 1;
let search = false;
let prevSort = "";
let scrollPos = 0;

fetchData().then((data) => {
  showDigimons(data);
});

async function fetchData() {
  try {
    const response = await fetch("https://digimon-api.vercel.app/api/digimon");
    const data = await response.json();
    dataWithIndex = data.map((digimon, index) => {
      return { ...digimon, index: index + 1 };
    });
    return dataWithIndex;
  } catch (error) {
    console.log("Error fetching data:", error);
  }
}

function showDigimons(digimons) {
  if (search) {
    digimons = dataSearch;
  }
  if (sorted !== prevSort || search === "yes") {
    switch (sorted) {
      case "name_asc":
        digimons.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_des":
        digimons.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "level_asc":
        digimons.sort((a, b) => customSort(a, b));
        break;
      case "level_des":
        digimons.sort((a, b) => customSort(b, a));
        break;
      default:
        digimons.sort((a, b) => a.index - b.index);
        break;
    }
    updateSortButtons();
    prevSort = sorted;
  }

  if (limit === "all") {
    paginationContainerT.style.display = "none";
    paginationContainerB.style.display = "none";
    digimonList.innerHTML = digimons
      .map(
        (digimon) => `
                    <div class="card m-1">
                        <img src="${digimon.img}" class="card-img-top" alt="${digimon.name}" onclick="toggleCard(this.parentNode)">
                        <div class="card-body">
                            <hr>
                            <h5 class="card-title">${digimon.index}. ${digimon.name}</h5>
                            <hr>
                            <p class="card-text">Level: ${digimon.level}</p>
                            <hr>
                        </div>
                    </div>
                    `
      )
      .join("");
  } else {
    const containers = [paginationContainerT, paginationContainerB];
    containers.forEach((container) => {
      container.style.display = "flex";
    });

    paginationCreate(digimons, containers);
    digimonList.innerHTML = digimons
      .slice(parseInt(limit) * (pageNum - 1), parseInt(limit) * pageNum)
      .map(
        (digimon) => `
                    <div class="card m-1">
                        <img src="${digimon.img}" class="card-img-top" alt="${digimon.name}" onclick="toggleCard(this.parentNode)">
                        <div class="card-body">
                            <hr>
                            <h5 class="card-title">${digimon.index}. ${digimon.name}</h5>
                            <hr>
                            <p class="card-text">Level: ${digimon.level}</p>
                            <hr>
                        </div>
                    </div>
                    `
      )
      .join("");
  }
  scrollBtns();
}

function updateSortButtons() {
  let sortNameArrow = sortNameBtn.children.item(0);
  let sortLevelArrow = sortLevelBtn.children.item(0);
  [sortNameArrow, sortLevelArrow].forEach((btn) => {
    btn.removeAttribute("class");
    btn.classList.add("fas", "fa-sort");
  });

  [sortNameBtn, sortLevelBtn, sortNoneBtn].forEach((btn) => {
    btn.removeAttribute("class");
  });
  switch (sorted) {
    case "name_asc":
      sortNameBtn.classList.add("sort-button", "active", "asc");
      sortNameArrow.classList.replace(sortNameArrow.classList[1], "fa-sort-up");
      break;
    case "name_des":
      sortNameBtn.classList.add("sort-button", "active", "des");
      sortNameArrow.classList.replace(
        sortNameArrow.classList[1],
        "fa-sort-down"
      );
      break;
    case "level_asc":
      sortLevelBtn.classList.add("sort-button", "active", "asc");
      sortLevelArrow.classList.replace(
        sortLevelArrow.classList[1],
        "fa-sort-up"
      );
      break;
    case "level_des":
      sortLevelBtn.classList.add("sort-button", "active", "des");
      sortLevelArrow.classList.replace(
        sortLevelArrow.classList[1],
        "fa-sort-down"
      );
      break;
    default:
      sortNoneBtn.classList.add("sort-button", "active");
      break;
  }
}

function customSort(a, b) {
  const aIndex = reference.indexOf(a.level);
  const bIndex = reference.indexOf(b.level);
  if (aIndex < bIndex) {
    return -1;
  } else if (aIndex > bIndex) {
    return 1;
  } else {
    if (sorted === "level_asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  }
}

function toggleCard(cardClicked) {
  const cards = document.querySelectorAll(".card");
  if (cardClicked.classList.contains("active")) {
    cards.forEach((card) => {
      card.classList.remove("active");
      card.style.display = "block";
    });
    window.scrollTo({
      top: (0, scrollPos),
      behavior: "instant",
    });
    paginationContainerT.style.display = "flex";
    paginationContainerB.style.display = "flex";
  } else {
    scrollPos = window.pageYOffset;
    cardClicked.classList.add("active");
    cardClicked.style.display = "flex";
    cards.forEach((card) => {
      if (!card.classList.contains("active")) {
        card.style.display = "none";
      }
    });
    window.scrollTo({
      top: (0, 0),
      behavior: "instant",
    });
    paginationContainerT.style.display = "none";
    paginationContainerB.style.display = "none";
  }
  scrollBtns();
}

function paginationCreate(digimons, containers) {
  containers.forEach((container) => {
    container.innerHTML = "";

    const MAX_PAGES = 5;
    const numPages = Math.ceil(digimons.length / limit);
    const currentPage = pageNum <= numPages ? pageNum : numPages;
    if (numPages > 1) {
      let startPage = Math.max(currentPage - Math.floor(MAX_PAGES / 2), 1);
      let endPage = Math.min(startPage + MAX_PAGES - 1, numPages);

      if (endPage - startPage + 1 < MAX_PAGES) {
        startPage = Math.max(endPage - MAX_PAGES + 1, 1);
      }

      const prevButton = document.createElement("button");
      prevButton.innerText = "\u{279C}";
      prevButton.style.transform = "rotate(180deg)";
      prevButton.className = "btn btn-secondary";
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener("click", () => {
        pageNum = currentPage - 1;
        showDigimons(digimons);
      });
      container.appendChild(prevButton);

      // first page button
      const firstButton = document.createElement("button");
      firstButton.innerText = 1;
      firstButton.className = "btn btn-secondary";
      firstButton.dataset.page = 1;
      if (currentPage === 1) {
        firstButton.classList.add("active");
      }
      firstButton.addEventListener("click", () => {
        pageNum = 1;
        showDigimons(digimons);
      });
      container.appendChild(firstButton);

      // "..." button before start page
      if (startPage > 2) {
        const hiddenButton = document.createElement("button");
        hiddenButton.innerText = "\u{22EF}";
        hiddenButton.className = "btn btn-secondary";
        hiddenButton.disabled = true;
        container.appendChild(hiddenButton);
      }

      // page buttons
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== numPages) {
          const pageButton = document.createElement("button");
          pageButton.innerText = i;
          pageButton.className = "btn btn-secondary";
          pageButton.dataset.page = i;
          if (i === currentPage) {
            pageButton.classList.add("active");
          }
          pageButton.addEventListener("click", () => {
            pageNum = i;
            showDigimons(digimons);
          });
          container.appendChild(pageButton);
        }
      }

      // "..." button after end page
      if (endPage < numPages - 1) {
        const hiddenButton = document.createElement("button");
        hiddenButton.innerText = "\u{22EF}";
        hiddenButton.className = "btn btn-secondary";
        hiddenButton.disabled = true;
        container.appendChild(hiddenButton);
      }

      // last page button
      const lastButton = document.createElement("button");
      lastButton.innerText = numPages;
      lastButton.className = "btn btn-secondary";
      lastButton.dataset.page = numPages;
      if (currentPage === numPages) {
        lastButton.classList.add("active");
      }
      lastButton.addEventListener("click", () => {
        pageNum = numPages;
        showDigimons(digimons);
      });
      container.appendChild(lastButton);

      // "Next" button
      const nextButton = document.createElement("button");
      nextButton.innerText = "\u{279C}";
      nextButton.className = "btn btn-secondary";
      nextButton.disabled = currentPage === numPages;
      nextButton.addEventListener("click", () => {
        pageNum = currentPage + 1;
        showDigimons(digimons);
      });
      container.appendChild(nextButton);
    }
    pageNum = currentPage;
  });
}

function scrollBtns() {
  scrollTopBtn.style.visibility = window.scrollY > 0 ? "visible" : "hidden";
  scrollBotBtn.style.visibility =
    document.documentElement.scrollHeight - window.innerHeight >
    window.scrollY + 2
      ? "visible"
      : "hidden";
}

header[0].addEventListener("click", () => {
  window.location.reload();
});

select.addEventListener("change", () => {
  limit = select.value;
  showDigimons(dataWithIndex);
});

sortNameBtn.addEventListener("click", () => {
  sorted = sorted === "name_asc" ? "name_des" : "name_asc";
  showDigimons(dataWithIndex);
});

sortLevelBtn.addEventListener("click", () => {
  sorted = sorted === "level_asc" ? "level_des" : "level_asc";
  showDigimons(dataWithIndex);
});

sortNoneBtn.addEventListener("click", () => {
  sorted = "none";
  showDigimons(dataWithIndex);
});

searchInput.addEventListener("input", () => {
  search = true;
  if (searchInput.value.trim() !== "") {
    const searchValue = searchInput.value.toLowerCase();
    digimons = dataWithIndex.filter((item) => {
      const name = item.name.toLowerCase();
      if (name.includes(searchValue)) {
        return true;
      } else {
        return false;
      }
    });
    searchBtn.classList.replace(searchBtn.classList[2], "fa-eraser");
    dataSearch = digimons;
    showDigimons(dataSearch);
  } else {
    search = false;
    showDigimons(dataWithIndex);
  }
});

searchBtn.addEventListener("click", () => {
  searchBtn.classList.replace(searchBtn.classList[2], "fa-magnifying-glass");
  searchInput.value = "";
  search = false;
  showDigimons(dataWithIndex);
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

scrollBotBtn.addEventListener("click", () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", () => {
  scrollBtns();
});

window.addEventListener("resize", () => {
  scrollBtns();
});

document.addEventListener("DOMSubtreeModified", () => {
  scrollBtns();
});
