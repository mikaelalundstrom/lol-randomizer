// ON LOAD SETUP
window.addEventListener("load", async () => {
  await setupChampions(championList);
  setupRoleButtons();
  setupRandomizeBtn();
  renderRandomChamp(randomize(getIncludedChampions()));
  renderPoolList(getIncludedChampions(), "included");
  renderPoolList(getExcludedChampions(), "excluded");
  setupPoolRemoveButtons();
  setupReversePoolsBtn();
  scrollParallaxEffect();
});

// SETUP CHAMPIONS: CHECK LS, OTHERWISE FETCH
async function setupChampions(championList) {
  let champions = getIncludedChampions();

  if (champions.length === 0) {
    let excludedChampions = getExcludedChampions();

    if (excludedChampions.length === 0) {
      champions = await setChampIds(championList);
      setIncludedChampions(champions);
    }
  }

  return champions;
}

// UPDATE CHAMP OBJS WITH OFFICIAL IDS (FOR GETTING IMGS)
async function setChampIds(champions) {
  try {
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion.json"
    );

    const data = await response.json();
    const champData = data.data;
    championsUpdated = champions.map((champion) => {
      for (const champ in champData) {
        if (champion.name === champData[champ].name) {
          champion.id = champData[champ].id;
          champion.title = champData[champ].title;
        }
      }
      return champion;
    });

    return championsUpdated;
  } catch (error) {
    console.log(error);
  }
}

// SET INCLUDED CHAMPS IN LS
function setIncludedChampions(champions) {
  localStorage.setItem("LoLRandom_Included", JSON.stringify(champions));
}

// // SET EXCLUDED CHAMPS IN LS
function setExcludedChampions(champions) {
  localStorage.setItem("LoLRandom_Excluded", JSON.stringify(champions));
}

// GET INCLUDED CHAMPS FROM LS
function getIncludedChampions() {
  return JSON.parse(localStorage.getItem("LoLRandom_Included")) || [];
}

// GET EXCLUDED CHAMPS FROM LS
function getExcludedChampions() {
  return JSON.parse(localStorage.getItem("LoLRandom_Excluded")) || [];
}

// GET CHAMP OBJ FROM NAME + POOL
function getSingleChampion(champName, currentPool) {
  let champion;
  if (currentPool === "included") {
    getIncludedChampions().forEach((includedChampion) => {
      if (includedChampion.name === champName) {
        champion = includedChampion;
      }
    });
  } else if (currentPool === "excluded") {
    getExcludedChampions().forEach((excludedChampion) => {
      if (excludedChampion.name === champName) {
        champion = excludedChampion;
      }
    });
  }

  return champion;
}

// SETUP ROLE FILTER BUTTONS
function setupRoleButtons() {
  const roleBtnRefs = document.querySelectorAll("button.role");
  roleBtnRefs.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (e.currentTarget.classList.contains("all")) {
        if (e.currentTarget.classList.contains("active")) {
          roleBtnRefs.forEach((btn) => btn.classList.remove("active"));
        } else {
          roleBtnRefs.forEach((btn) => btn.classList.add("active"));
        }
      } else if (e.currentTarget.classList.contains("active")) {
        e.currentTarget.classList.remove("active");
        areAllBtnsActive();
      } else {
        e.currentTarget.classList.add("active");
        areAllBtnsActive();
      }
    });
  });
}

// fix for 'all' button displaying incorrectly sometimes
function areAllBtnsActive() {
  const roleBtnRefs = document.querySelectorAll("button.role");

  const onlyRoleBtns = [...roleBtnRefs].filter((btn) => !btn.classList.contains("all"));

  if (onlyRoleBtns.every((btn) => btn.classList.contains("active"))) {
    document.querySelector("button.role.all").classList.add("active");
  } else {
    document.querySelector("button.role.all").classList.remove("active");
  }
}

// SETUP RANDOMIZE BUTTON
function setupRandomizeBtn() {
  randomizeBtnRef = document.querySelector("button.randomize");
  randomizeBtnRef.addEventListener("click", () => {
    if (document.querySelector("button.role.all").classList.contains("active")) {
      renderRandomChamp(randomize(getIncludedChampions()));
    } else {
      const roleBtnRefs = document.querySelectorAll("button.role");
      const onlyActiveBtns = [...roleBtnRefs].filter((btn) => btn.classList.contains("active"));
      let activeRoles = [];
      onlyActiveBtns.forEach((btn) => {
        activeRoles.push(btn.innerText);
      });
      const filteredChamps = new Set([]);
      getIncludedChampions().forEach((champion) => {
        activeRoles.forEach((role) => {
          if (champion.roles.includes(role)) {
            filteredChamps.add(champion);
          }
        });
      });
      const filteredChampsList = [...filteredChamps];
      renderRandomChamp(randomize(filteredChampsList));
    }
  });
}

// RANDOMIZE A CHAMPION
function randomize(champions) {
  const random = Math.floor(Math.random() * champions.length);
  return champions[random];
}

// RENDER RANDOMIZED CHAMP
async function renderRandomChamp(randomChamp) {
  const resultRef = document.querySelector(".result");
  resultRef.classList.remove("d-none");
  resultRef.innerHTML = "";

  const backgroundRef = document.createElement("div");
  backgroundRef.classList.add("background");
  backgroundRef.classList.add("fadein");

  if (randomChamp !== undefined) {
    backgroundRef.style.backgroundImage = `url("https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${randomChamp.id}_0.jpg")`;
    document.querySelector(
      "body"
    ).style.backgroundImage = `url("https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${randomChamp.id}_0.jpg")`;
  }

  resultRef.appendChild(backgroundRef);

  const infoRef = document.createElement("div");
  infoRef.classList.add("info");
  const champNameRef = document.createElement("h2");

  if (randomChamp === undefined) {
    champNameRef.textContent = "No valid champion found.";
    champNameRef.classList.add("error");
    infoRef.appendChild(champNameRef);
    resultRef.appendChild(infoRef);
  } else {
    const skinRerollRef = document.createElement("p");
    skinRerollRef.classList.add("skin");
    skinRerollRef.innerHTML = `Skin <i class="ph ph-arrows-clockwise"></i>`;
    resultRef.appendChild(skinRerollRef);

    champNameRef.textContent = randomChamp.name;
    infoRef.appendChild(champNameRef);

    const subTitleRef = document.createElement("h3");
    subTitleRef.classList.add("sub-title");
    subTitleRef.textContent = randomChamp.title;
    infoRef.appendChild(subTitleRef);

    const rolesContainerRef = document.createElement("div");
    rolesContainerRef.classList.add("roles");

    randomChamp.roles.forEach((role) => {
      const roleRef = document.createElement("div");
      roleRef.classList.add("role");
      const roleFigureRef = document.createElement("figure");
      const roleImgRef = document.createElement("img");
      roleImgRef.src = `./assets/icon-${role}.png`;
      roleImgRef.alt = role;
      roleFigureRef.appendChild(roleImgRef);
      roleRef.appendChild(roleFigureRef);
      const roleTextRef = document.createElement("p");
      roleTextRef.innerText = role;
      roleRef.appendChild(roleTextRef);
      rolesContainerRef.appendChild(roleRef);
    });

    infoRef.appendChild(rolesContainerRef);
    resultRef.appendChild(infoRef);

    setupRandomSkinBtn(randomChamp);
  }
}

// SETUP BUTTON FOR RANDOM SKIN
function setupRandomSkinBtn(champion) {
  const skinBtnRef = document.querySelector(".result .skin");
  skinBtnRef.addEventListener("click", async () => {
    const backgroundRef = document.querySelector(".result .background");
    backgroundRef.classList.remove("fadein");
    backgroundRef.style.opacity = "0";
    backgroundRef.style.backgroundImage = await getRandomSkin(champion);
    document.querySelector("body").style.backgroundImage = backgroundRef.style.backgroundImage;
  });
}

// FETCH VALID SKIN IDS AND GET RANDOM SKIN
async function getRandomSkin(champion) {
  try {
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion/${champion.id}.json`
    );
    const data = await response.json();
    const skins = data.data[champion.id].skins;
    const random = Math.floor(Math.random() * skins.length);
    const backgroundRef = document.querySelector(".result .background");
    backgroundRef.classList.add("fadein");
    const subTitleRef = document.querySelector(".sub-title");

    let randomSkin = `url("https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skins[random].num}.jpg")`;
    if (skins[random].name !== "default") {
      subTitleRef.textContent = skins[random].name;
    } else {
      subTitleRef.textContent = champion.title;
    }
    if (randomSkin === backgroundRef.style.backgroundImage && skins.length > 1) {
      while (randomSkin === backgroundRef.style.backgroundImage) {
        const random = Math.floor(Math.random() * skins.length);
        randomSkin = `url("https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skins[random].num}.jpg")`;
        if (skins[random].name !== "default") {
          subTitleRef.textContent = skins[random].name;
        } else {
          subTitleRef.textContent = champion.title;
        }
      }
    }
    return randomSkin;
  } catch (error) {
    console.log(error);
  }
}

// RENDER LIST OF CHAMPS IN POOL
function renderPoolList(champions, type) {
  const listNumberRef = document.querySelector(`.${type} .list-title span`);

  if (champions.length > 0) {
    listNumberRef.textContent = `(${champions.length})`;
  } else {
    listNumberRef.textContent = "(0)";
  }

  champions.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  const listContainerRef = document.querySelector(`.${type} .list-items-container`);
  listContainerRef.innerHTML = "";
  champions.forEach((champion) => {
    const liRef = document.createElement("li");
    liRef.classList.add("list-item");

    const iconRef = document.createElement("figure");
    iconRef.classList.add("icon");

    const removeRef = document.createElement("i");
    removeRef.classList.add("ph-bold");
    removeRef.classList.add("ph-x");
    removeRef.classList.add("remove");
    iconRef.appendChild(removeRef);

    const iconImgRef = document.createElement("img");
    iconImgRef.src = `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/${champion.id}.png`;
    iconImgRef.alt = champion.name;
    iconRef.appendChild(iconImgRef);
    liRef.appendChild(iconRef);

    const nameRef = document.createElement("p");
    nameRef.classList.add("name");
    nameRef.textContent = champion.name;
    liRef.appendChild(nameRef);

    const rolesRef = document.createElement("p");
    rolesRef.classList.add("roles");

    champion.roles.forEach((role) => {
      const roleRef = document.createElement("figure");
      roleRef.classList.add("role");
      const roleImgRef = document.createElement("img");
      roleImgRef.src = `./assets/icon-${role}.png`;
      roleImgRef.alt = role;
      roleRef.appendChild(roleImgRef);
      rolesRef.appendChild(roleRef);
    });
    liRef.appendChild(rolesRef);
    listContainerRef.appendChild(liRef);
  });

  setUpSearch(type);
}

// SETUP REMOVE FROM POOL BUTTONS
function setupPoolRemoveButtons() {
  const removeChampRefs = document.querySelectorAll(".list-item .icon");
  removeChampRefs.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const champName = e.currentTarget.lastChild.alt;
      const currentPoolRef = e.currentTarget.parentElement.parentElement.parentElement;

      let currentPool;
      if (currentPoolRef.classList.contains("included")) {
        currentPool = "included";
      } else if (currentPoolRef.classList.contains("excluded")) {
        currentPool = "excluded";
      }

      let champion = getSingleChampion(champName, currentPool);
      switchChampPools(champion, currentPool);
    });
  });
}

// SWITCH CHAMPION BETWEEN POOLS
function switchChampPools(champion, currentPool) {
  if (currentPool === "included") {
    let includedChampions = getIncludedChampions();
    includedChampions = includedChampions.filter(
      (includedChampion) => includedChampion.name !== champion.name
    );
    setIncludedChampions(includedChampions);

    let excludedChampions = getExcludedChampions();
    excludedChampions.push(champion);
    setExcludedChampions(excludedChampions);
  } else if (currentPool === "excluded") {
    let excludedChampions = getExcludedChampions();
    excludedChampions = excludedChampions.filter(
      (includedChampion) => includedChampion.name !== champion.name
    );
    setExcludedChampions(excludedChampions);

    let includedChampions = getIncludedChampions();
    includedChampions.push(champion);
    setIncludedChampions(includedChampions);
  }
  renderPoolList(getIncludedChampions(), "included");
  renderPoolList(getExcludedChampions(), "excluded");
  setupPoolRemoveButtons();
}

// SWITCH ALL CHAMPIONS TO OPPOSITE POOL
function setupReversePoolsBtn() {
  const reverseRef = document.querySelector(".switch");
  reverseRef.addEventListener("click", () => {
    const includedChampions = getIncludedChampions();
    const excludedChampions = getExcludedChampions();
    setIncludedChampions(excludedChampions);
    setExcludedChampions(includedChampions);

    renderPoolList(getIncludedChampions(), "included");
    renderPoolList(getExcludedChampions(), "excluded");
    setupPoolRemoveButtons();
  });
}

// SETUP SEARCH FOR POOL LISTS
function setUpSearch(type) {
  const inputRef = document.querySelector(`.${type} .search`);
  inputRef.value = "";

  inputRef.addEventListener("input", (e) => {
    const liItemNameRefs = document.querySelectorAll(`.${type} .list-item .name`);

    liItemNameRefs.forEach((liItemName) => {
      if (!liItemName.textContent.toLowerCase().includes(e.target.value.toLowerCase())) {
        liItemName.parentElement.classList.add("d-none");
      } else {
        liItemName.parentElement.classList.remove("d-none");
      }
    });
  });
}

// SCROLL PARALLAX EFFECT SETUP
function scrollParallaxEffect() {
  let position = 0;
  let ticking = false;

  document.addEventListener("scroll", (event) => {
    position = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateBackgroundPos(position);
        ticking = false;
      });

      ticking = true;
    }
  });
}

// APPLY SCROLL EFFECT
function updateBackgroundPos(position) {
  const bodyRef = document.querySelector("body");

  let maximum = bodyRef.scrollHeight - window.innerHeight;
  let precentage = position / maximum;
  let precentageRounded = Math.round(precentage * 100);

  let newValue = `50% ${precentageRounded}%`;

  let currentValue = getComputedStyle(bodyRef).getPropertyValue("background-position");

  if (currentValue !== newValue) {
    bodyRef.style.setProperty("background-position", newValue);
  }
}
