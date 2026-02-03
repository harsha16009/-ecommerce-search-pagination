(() => {
  "use strict";

  // Products 
  const listEl = document.getElementById("list");
  const pageEl = document.getElementById("page");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  const searchInputEl = document.getElementById("input");
  const searchBtnEl = document.getElementById("btn");

  // Search history 
  const historyInputEl = document.getElementById("SearchInput");
  const historyBtnEl = document.getElementById("search");
  const historyListEl = document.getElementById("historyList");

  let products = [];
  const itemsPerPage = 5;
  let currentPage = 1;

  function getTotalPages() {
    return Math.max(1, Math.ceil(products.length / itemsPerPage));
  }

  function updatePager() {
    const total = getTotalPages();
    if (pageEl) pageEl.textContent = `Page ${currentPage} / ${total}`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= total;
  }

  function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.className = "card__img";
    img.src = product.thumbnail;
    img.alt = product.title;
    img.loading = "lazy";

    const title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = product.title;

    const desc = document.createElement("p");
    desc.className = "card__desc";
    desc.textContent = product.description;

    const price = document.createElement("p");
    price.className = "card__price";
    price.textContent = `Price: $${product.price}`;

    card.append(img, title, desc, price);
    return card;
  }

  function renderProducts() {
    if (!listEl) return;

    listEl.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = products.slice(start, end);

    if (pageData.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No products found.";
      listEl.appendChild(empty);
      updatePager();
      return;
    }

    for (const product of pageData) {
      listEl.appendChild(createProductCard(product));
    }

    updatePager();
  }

  async function loadProducts(query = "") {
    if (!listEl) return;

    const trimmedQuery = query.trim();
    currentPage = 1;

    listEl.innerHTML = "";
    {
      const loading = document.createElement("p");
      loading.textContent = "Loading...";
      listEl.appendChild(loading);
    }
    updatePager();

    const base = "https://dummyjson.com/products";
    const url = trimmedQuery
      ? `${base}/search?q=${encodeURIComponent(trimmedQuery)}`
      : base;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      products = Array.isArray(json.products) ? json.products : [];
      renderProducts();
    } catch (err) {
      products = [];
      listEl.innerHTML = "";
      {
        const error = document.createElement("p");
        error.textContent = "Failed to load products. Check your internet connection.";
        listEl.appendChild(error);
      }
      updatePager();
      console.error(err);
    }
  }

  // Pagination buttons
  nextBtn?.addEventListener("click", () => {
    const total = getTotalPages();
    if (currentPage < total) {
      currentPage += 1;
      renderProducts();
    }
  });

  prevBtn?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderProducts();
    }
  });

  // Search (top input/button)
  function doSearch() {
    const q = (searchInputEl?.value ?? "").trim();
    loadProducts(q);
    if (q) saveSearchHistory(q);
  }

  searchBtnEl?.addEventListener("click", doSearch);
  searchInputEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  // Search history (localStorage)
  function readHistory() {
    const raw = localStorage.getItem("searchHistory");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  }

  function saveSearchHistory(query) {
    const history = readHistory();
    history.push(query);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    renderSearchHistory();
  }

  function renderSearchHistory() {
    if (!historyListEl) return;

    const history = readHistory();
    historyListEl.innerHTML = "";

    for (const item of history.slice(-10).reverse()) {
      const li = document.createElement("li");
      li.className = "history-item";
      li.textContent = item;
      li.addEventListener("click", () => {
        if (searchInputEl) searchInputEl.value = item;
        loadProducts(item);
      });
      historyListEl.appendChild(li);
    }
  }

  historyBtnEl?.addEventListener("click", () => {
    const q = (historyInputEl?.value ?? "").trim();
    if (!q) return;
    saveSearchHistory(q);
    if (historyInputEl) historyInputEl.value = "";
  });

  renderSearchHistory();
  loadProducts();
})();
