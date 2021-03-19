// PokeAPI URL 
// al pokemons
const URL_ALL_POKEMONS = 'https://pokeapi.co/api/v2/pokemon?limit=386'
// Pokemon URL by id
const pokemonDetail = (id) => `https://pokeapi.co/api/v2/pokemon/${id}`

// Globals

const pokemonImgSrc = (id) =>  `assets/images/sprites/${id}.png`
const typeImgSrc = (type) =>  `assets/images/types/${type}.svg`

// Array of all pokemon names
let allPokemonNames = []
// Pokedex state
let localPokedex = []
// Array of remaining pokemons names and ids
let remaining = []
// correct pokemon answer
let correctPokemon = {}
// user name for local storage
let userName=''


// DOM
const header = document.getElementById('header')
const pokedex = document.getElementById('pokedex')
const ball = document.getElementById('ball')
const registerName = document.getElementById('register-name')
const register = document.getElementById('register')
const playSection = document.getElementById('play-section')
const playContainer = document.getElementById('play-container')
const controls = document.getElementById('controls')
const titleContainer = document.getElementById('title-container')
const content = document.getElementById('content-section')
const pokeImageContainer = document.getElementById('poke-image-container')
const pokeImage = document.getElementById('who-is')
const questions = document.getElementById('questions')
const questionButtons = [...document.querySelectorAll('.questions__button')]
const viewer = document.getElementById('viewer')
const modal = document.getElementById('modal')


// open pokedex
ball.addEventListener('click', () => {
  pokedex.classList.add('pokedex--open')
})

// on submit user name
register.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (validateUser()) {
    userName = registerName.value
    playContainer.classList.add('play--loading')
    const insidePokedex = await checkPokedex()

    registerName.value = ''
    register.classList.remove('register--error')
    pokedex.classList.remove('pokedex--open')
    pokedex.classList.add('pokedex--hide')
    header.classList.add('header--hide')
    playSection.classList.add('play--show')
    playContainer.classList.remove('play--loading')
  } else {
    register.classList.add('register--error')
  }
})

// close pokedex
const closePokedex = () => {
  playSection.classList.remove('play--show')
  pokedex.classList.remove('pokedex--hide')
  header.classList.remove('header--hide')
  titleContainer.classList.remove('play__title-container--next')
  content.classList.remove('content--next')
  userName= ''
}

// slide to pokedex section
const slideNex = () => {
  titleContainer.classList.add('play__title-container--next')
  content.classList.add('content--next')
}

// slide to game section
const slidePrev = () => {
  titleContainer.classList.remove('play__title-container--next')
  content.classList.remove('content--next')
}

controls.addEventListener('click', e => {
  if (e.target.classList.contains('exit'))
    closePokedex()
  if (e.target.classList.contains('next'))
    slideNex()
  if (e.target.classList.contains('prev'))
    slidePrev()
})

// check user name format
const validateUser = () => {
  const regex = /^[a-zA-Z0-9]{1,10}$/
  return regex.test(registerName.value.toLowerCase())
}

// get random pokemon id
const getRandomNumber = (max = 386) => Math.floor(Math.random() * max)

// get 4 pokemons to play
const getAnswers = async (answers = 4) => {
  const options = []
  const currentPokemon = remaining[getRandomNumber(remaining.length)]
  if (currentPokemon !== undefined) {
    options.push(currentPokemon)
    while (options.length < answers) {
      const index = getRandomNumber()
      const newAnswer = {name: allPokemonNames[index], id: index + 1}
      if (!options.includes(selectedPokemon => ponewAnswer.name === selectedPokemon.name)) {
        options.push(newAnswer)
      }
    }
    correctPokemon = options[0]
    const allAnswers = options.sort(() => Math.random() - 0.5)
    await writeGame(allAnswers)
  } else {
    getAnswers()
  }
}

// cheeck pokedex in local storage
const checkPokedex = () => {
  playContainer.classList.add('play--loading')
  // if exists pokedex in local storage
  if (localStorage.getItem(`pokedex-${userName}`)) {
    localPokedex = JSON.parse(localStorage.getItem(`pokedex-${userName}`))
    allPokemonNames = localPokedex.map(pokemon => pokemon.name)
    setRemainingPokemons()
  } else {
    // create pokedex in local storage
    fetch(URL_ALL_POKEMONS)
    .then(res => res.json())
    .then(data => {
        allPokemonNames = data.results.map(pokemon => pokemon.name)
        localPokedex = allPokemonNames.map((pokemon, index) => ({
          id: index + 1,
          name: pokemon,
          catched: false,
          types: []
        }))
        localStorage.setItem(`pokedex-${userName}`, JSON.stringify(localPokedex))
        setRemainingPokemons()
        return true
      }).catch(e => {
        console.log(e)
        playContainer.classList.remove('play--loading')
        playModalError(e)
        return false
      })
  }
}


const setRemainingPokemons = () => {
  localPokedex.forEach(pokemon => {
    if (!pokemon.catched) {
      remaining.push({name: pokemon.name, id: pokemon.id})
    }
  })
  createPokedex()
}

// draw pokedex content
const createPokedex = () => {
  
  /* structure not catched
  
    <div class="card">
      <p class="card__id">#${pokemon.id}</p>
      <div class="card__image"></div>
    </div>
    
    structure catched
    
    <div class="card ${pokemon.types[0]}" data-id="${pokemon.id}">
      <p class="card__id" data-id="${pokemon.id}>#${pokemon.id}</p>
        <div class="card__image card__image--catched data-id="${pokemon.id}">
        <img src="${pokemonImgSrc(pokemon.id)" alt="${pokemon.name}" class="card__catched" data-id="${pokemon.id}>
      </div>
    </div>
  */
   
  viewer.textContent = ''
  const fragment = document.createDocumentFragment()
  localPokedex.forEach(pokemon => {
    const pokeCard = document.createElement('div')
    pokeCard.classList.add('card')
    const pokeId = document.createElement('p')
    pokeId.classList.add('card__id')
    pokeId.textContent = `#${pokemon.id}`
    pokeId.setAttribute('data-id', pokemon.id)
    const pokeImgContainer = document.createElement('div')
    pokeImgContainer.classList.add('card__image')   
    if (pokemon.catched) {
      pokeCard.classList.add(pokemon.types[0])
      pokeCard.setAttribute('data-id', pokemon.id)
      pokeImgContainer.classList.add('card__image--catched')
      pokeImgContainer.setAttribute('data-id', pokemon.id)
      const pokeImage  = document.createElement('img')
      pokeImage.classList.add('card__catched')
      pokeImage.src = pokemonImgSrc(pokemon.id)
      pokeImage.alt = pokemon.name
      pokeImage.setAttribute('data-id', pokemon.id)
      pokeImgContainer.appendChild(pokeImage)
    }
    pokeCard.appendChild(pokeId)
    pokeCard.appendChild(pokeImgContainer)
    fragment.appendChild(pokeCard)
  })
  viewer.appendChild(fragment)
  getAnswers()
}

const writeGame = answers => {
  // show loader
  playContainer.classList.add('play--loading')
  // find pokemon type
  fetch(pokemonDetail(correctPokemon.id))
    .then(res => res.json())
      .then(({types}) => {
        // save types
        const pokeTypes = types.map(t => t.type.name)
        localPokedex[correctPokemon.id - 1].types = pokeTypes
        correctPokemon = localPokedex[correctPokemon.id - 1]
        localStorage.setItem(`pokedex-${userName}`, JSON.stringify(localPokedex))
        // download image of pokemon
        fetch(pokemonImgSrc(correctPokemon.id))
        .then(() =>{
          //display game
          questionButtons.forEach( (questionButton, index) =>{
            questionButton.textContent = answers[index].name
          })
          pokeImage.src = pokemonImgSrc(correctPokemon.id)
          // hide loader 
          playContainer.classList.remove('play--loading')
        }).catch(e => {
          console.log(e)
          playContainer.classList.remove('play--loading')
          playModalError(e)
        })
      }).catch(e => {
        console.log(e)
        playContainer.classList.remove('play--loading')
        playModalError(e)
      })
}

const playModalError = (error) => {
  
   modal.textContent = ''
   /* 
   structure
   <p class="error">${error}</p>
   */
  const errorText = document.createElement('p')
  errorText.classList.add('error')
  errorText.textContent = error
  modal.appendChild(errorText)
  playSection.classList.add('play--modal')
}

//show Pokemon Information
const playModal = (pokemon) => {
  
  /* 
  structure
  <div class="modal ${pokemon.types[0]}">
    <button class="modal__close">X</button>
    <div class="modal__image">
      <img src="${pokemonImgSrc(pokemon.id)}" alt="${pokemon.name}">
      </div>
    <p class="modal__description">id: ${pokemon.id}</p>
    <p class="modal__description">name: ${pokemon.name}</p>
    <p class="modal__description">Types</p>
    <ul class="list">
      <li class="list__item" data-type="${pokemon.type[n]}">
       <img src="${typeImgSrc(pokemon.type[n])}" alt="${pokemon.type[n]}">
      </li>
      ...
    </ul>
    </div>
  */
  modal.textContent = ''
  const fragment = document.createDocumentFragment()
  const buttonClose = document.createElement('button')
  const modalContainer = document.createElement('div')
  modalContainer.classList.add('modal')
  modalContainer.classList.add(pokemon.types[0])
  buttonClose.classList.add('modal__close')
  buttonClose.textContent = "X"
  modalContainer.appendChild(buttonClose)
  const pokemonInfo = document.createElement('div')
  pokemonInfo.classList.add('modal__image')
  const pokemonImage = document.createElement('img')
  pokemonImage.alt = pokemon.name
  pokemonImage.src = pokemonImgSrc(pokemon.id)
  const pokemonName = document.createElement('p')
  pokemonName.classList.add('modal__description')
  pokemonName.textContent = `#${pokemon.id} - ${pokemon.name}`
  const pokemonId = document.createElement('p')
  pokemonId.classList.add('modal__description')
  pokemonId.textContent = `Id: ${pokemon.id}`
  const pokemonTypes = document.createElement('p')
  pokemonTypes.classList.add('modal__description')
  pokemonTypes.textContent = 'Types:'
  pokemonInfo.appendChild(pokemonName)
  pokemonInfo.appendChild(pokemonImage)
  pokemonInfo.appendChild(pokemonTypes)
  modalContainer.appendChild(pokemonInfo)
  const typeList = document.createElement('ul')
  typeList.classList.add('list')
  pokemon.types.forEach(pokemonType => {
    const listItem = document.createElement('li')
    listItem.classList.add('list__item')
    const typeImage = document.createElement('img')
    listItem.classList.add(pokemonType)
    typeImage.alt = pokemonType
    typeImage.src = typeImgSrc(pokemonType)
    listItem.setAttribute('data-type', pokemonType)
    listItem.appendChild(typeImage)
    typeList.appendChild(listItem)
  })
  modalContainer.appendChild(typeList)
  fragment.appendChild(modalContainer)
  modal.appendChild(fragment)
  playSection.classList.add('play--modal')
}

modal.addEventListener('click', e => {
  if (e.target.classList.contains('modal__close')){
    modal.textContent = ''
    playSection.classList.remove('play--modal')
  }
  
})

const catchPokemon = () => {
  // display pokemon in colors and play catched animation
  pokeImageContainer.classList.add('image-container--catch')
  setTimeout(() => {
    pokeImageContainer.classList.remove('image-container--catch')
    getPokemonCard()
  }, 6000)
  localPokedex[correctPokemon.id - 1].catched = true
  localStorage.setItem(`pokedex-${userName}`, JSON.stringify(localPokedex))
  remaining = remaining.filter(pokemon => pokemon.id !== correctPokemon.id)
}

const getPokemonCard = () => {
  const allPokemonsCards = [...document.querySelectorAll('.card')]
  const pokemonCard = allPokemonsCards[correctPokemon.id - 1]

  pokemonCard.classList.add(correctPokemon.types[0])
  
  /* structure catched
    
    <div class="card ${pokemon.types[0]}" data-id="${pokemon.id}">
      <p class="card__id" data-id="${pokemon.id}">#${pokemon.id}</p>
      <div class="card__image card__image--catched" data-id="${pokemon.id}">
        <img src="${pokemonImgSrc(pokemon.id)" alt="${pokemon.name}" class="card__catched" data-id="${pokemon.id}">
      </div>
    </div>
  */
  pokemonCard.textContent = '' 
  pokemonCard.setAttribute('data-id', correctPokemon.id)
  const pokeId = document.createElement('p')
  pokeId.classList.add('card__id')
  pokeId.textContent = `#${correctPokemon.id}`
  pokeId.setAttribute('data-id', correctPokemon.id)
  const pokeImgContainer = document.createElement('div')
  pokeImgContainer.classList.add('card__image')
  pokeImgContainer.classList.add('card__image--catched')
  pokeImgContainer.setAttribute('data-id', correctPokemon.id)
  const pokeImage  = document.createElement('img')
  pokeImage.classList.add('card__catched')
  pokeImage.src = pokemonImgSrc(correctPokemon.id)
  pokeImage.alt = correctPokemon.name
  pokeImage.setAttribute('data-id', correctPokemon.id)
  const fragment = document.createDocumentFragment()
  fragment.appendChild(pokeId)
  pokeImgContainer.appendChild(pokeImage)
  fragment.appendChild(pokeImgContainer)
  pokemonCard.appendChild(fragment)
  slideNex()
  getAnswers()
  viewer.scrollTo({
    top: pokemonCard.offsetTop - 100,
    behavior: 'smooth'
  })
}

questions.addEventListener('click', e => {
  if (e.target.classList.contains('questions__button')) {
    if (e.target.textContent === correctPokemon.name) {
      catchPokemon()
    } else {
      getAnswers()
    }
  }
})


viewer.addEventListener('click', e => {
  if (e.target.getAttribute('data-id') !== null){
    const pokemon = localPokedex[e.target.getAttribute('data-id') - 1]
    playModal(pokemon)
  }
    
})
