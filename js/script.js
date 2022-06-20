const API_KEY = "d1b3473da88944318712bb56b5666356";
const choicesElem = document.querySelector(".js-choice");
const newsList = document.querySelector(".news-list");
const formSearch = document.querySelector(".form-search");
const title = document.querySelector(".title");
const choices = new Choices(choicesElem, {
  searchEnabled: false,
  itemSelectText: "",
});
console.log(choices);
const getdata = async (url) => {
  const response = await fetch(url, {
    headers: {
      "X-Api-Key": API_KEY,
    },
  });

  const data = await response.json();
  return data;
};

const getDateCorrectFormat = (isoDate) => {
  const date = new Date(isoDate);
  const fullDate = date.toLocaleString("en-GB", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const fullTime = date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `<span class="news-date">${fullDate}</span> ${fullTime}`;
};

const getImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image(270, 200);

    img.addEventListener("load", () => {
      resolve(img);
    });

    img.addEventListener("error", () => {
      reject(img);
    });

    img.src = url || "img/no-photo.jpg";
    img.className = "news-image";
    // console.log(image);
    return img;
  });

const renderCard = (data) => {
  // console.log(data);
  newsList.textContent = "";
  data.forEach(
    async ({ urlToImage, title, url, description, publishedAt, author }) => {
      const card = document.createElement("li");
      card.className = "news-item";

      const image = await getImage(urlToImage);
      image.alt = title;
      card.append(image);
      card.insertAdjacentHTML(
        "beforeend",
        `
            <h3 class="news-title">
              <a href="${url}" class="news-link" target="_blank">
               ${title || ""}
              </a>
            </h3>
            <p class="news-description">
              ${description || ""}
            </p>
            <div class="news-footer">
              <time class="news-datetime" datetime="${publishedAt}">
                ${getDateCorrectFormat(publishedAt)}
              </time>
              <div class="news-author">${author || ""}</div>
            </div>
    `
      );

      newsList.append(card);
    }
  );
};

const loadNews = async () => {
  newsList.innerHTML = '<li class="preload"></li>';
  // страна по дефолту или русский или из локала берем записанный ранее
  const country = localStorage.getItem("country") || "ru";
  // устанавливаю в селекте выбранную ранее страну
  choices.setChoiceByValue(country);
  title.classList.add("hide");
  const data = await getdata(
    `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=100`
  );
  renderCard(data.articles);
};

const loadSearch = async (value) => {
  const data = await getdata(
    `https://newsapi.org/v2/everything?q=${value}&pageSize=100`
  );
  title.classList.remove("hide");
  title.textContent = `По вашему запросу “${value}” найдено ${data.articles.length} результатов`;
  renderCard(data.articles);
};

// выбор языка (региона) новостей
choicesElem.addEventListener("change", (event) => {
  const value = event.detail.value;
  localStorage.setItem("country", value);
  loadNews();
});
formSearch.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = formSearch.search.value;
  loadSearch(value);
  formSearch.reset();
});
loadNews();
