//!/bin/env node

const fs = require('fs')
const fetch = require('node-fetch')
const dot = require('dot')
const dateformat = require('dateformat')

const render = dot.template(fs.readFileSync(__dirname + '/template.atom'))


function fetchStrips () {
  return fetch('http://localhost:5984/dandelion/_design/strips/_view/public')
    .then(r => r.json())
    .then(json => json.rows)
    .catch(err => {console.error(err)})
}

function renderItem (item,i) {
  const releaseDate = new Date(item.releaseDate)
  const title = `${item.chapter.slice(4).toUpperCase()} — Page ${i + 1}`
  const description = `Comic from ${dateformat(releaseDate, 'mmmm dS, yyyy')}`
  const url = `https://dandelion-comic.com/comic/${item._id}`
  const date = item.releaseDate
  return { title, description, date, url }
}

fetchStrips().then(strips => {
  let chapter = false, counter = 0

  const data = {
    title: 'Dandelion',
    description: 'A webcomic by Jenny Werner and Dana Johns',
    url: 'https://dandelion-comic.com',
    items: strips.map((item, i) => {
      if (chapter === item.value.chapter) counter++
      else {
        chapter = item.value.chapter
        counter = 0
      }
      return renderItem(item.value, counter)
    })
  }

  const atomFeed = render(data)
  console.log(atomFeed)
})
