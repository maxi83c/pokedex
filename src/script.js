const pokedex = document.getElementById('pokedex')
const ball = document.getElementById('ball')
const buttonGo = document.getElementById('button-go')

ball.addEventListener('click', e => {
  pokedex.classList.add('pokedex--open')
})

buttonGo.addEventListener('click', e => {
  pokedex.classList.remove('pokedex--open')
})