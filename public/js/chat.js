// const socket = io()



// //elements
// const $messageForm = document.querySelector('#message-form')
// const $messageFormButton = document.querySelector('button')
// const $messageFormInput = document.querySelector('input')
// const $shareLocation = document.querySelector('#share-location')
// const $messages = document.querySelector('#messages')


// //templates
// const messageTemplate = document.querySelector('#message-template').innerHTML
// const $locationTemplate = document.querySelector('#location-template').innerHTML

// // options
// const {username,room} =  Qs.parse(location.search,{ignoreQueryPrefix: true})



// socket.on('message', ({text,createdAt}) => {
//     const html = Mustache.render(messageTemplate, {
//         message:text,
//         createdAt:moment(createdAt).format('h:mm a')
//     })
//     $messages.insertAdjacentHTML('beforeend', html)
// })

// $messageForm.addEventListener('submit', (e) => {
//     e.preventDefault()

//     $messageFormButton.setAttribute('disabled', 'disabled')


//     let message = e.target.elements.chat

//     socket.emit('message', {message:message.value,username,room,}, (profanity) => {

//         $messageFormButton.removeAttribute('disabled', 'disabled')
//         $messageFormInput.focus()

//         if (profanity) {
//             return console.log(profanity)
//         }
//         console.log('your message was delivered')

//     })
//     message.value = ''

// })


// $shareLocation.addEventListener('click', () => {

//     const loading = document.querySelector('#loadingMsg')
//     loading.textContent = 'sharing location...'


//     if (!navigator.geolocation) {
//         return alert('geolocation is not supported bty yuor browser')
//     }
//     $shareLocation.setAttribute('disabled', 'disabled')
//     navigator.geolocation.getCurrentPosition(({ coords }) => {

//         socket.emit('location', {
//             longitude: coords.longitude,
//             latitude: coords.latitude,
//             room:room,
//             username,
//         }, () => {
//             loading.textContent = ''
//             $shareLocation.removeAttribute('disabled')
//             console.log('Location shared!')
//         })

//     })
// })

// socket.on('locationMsg',({location,username})=>{
//     const html = Mustache.render($locationTemplate,{
//         url:location.url,
//         created:moment(location.created).format('h:mm a'),
//         username,
//     })
//     $messages.insertAdjacentHTML('beforeend',html)

// })


// socket.emit('join',{username,room})



const socket = io()



//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormButton = document.querySelector('button')
const $messageFormInput = document.querySelector('input')
const $shareLocation = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height if new messsage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height

    const visibleHeight = $messages.offsetHeight

    // height of message container 
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled

    const scrollOffset = $messages.scrollTop +visibleHeight

    if(containerHeight - newMessageHeight <=scrollOffset)
    {$messages.scrollTop = $messages.scrollHeight}
}


socket.on('message', ({ text, createdAt, username }) => {
    const html = Mustache.render(messageTemplate, {
        message: text,
        createdAt: moment(createdAt).format('h:mm a'),
        username,
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    })
    $sidebar.innerHTML = html

})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')


    let message = e.target.elements.chat

    socket.emit('message', message.value, (profanity) => {

        $messageFormButton.removeAttribute('disabled', 'disabled')
        $messageFormInput.focus()

        if (profanity) {
            return console.log(profanity)
        }
        console.log('your message was delivered')

    })
    message.value = ''

})


$shareLocation.addEventListener('click', () => {

    const loading = document.querySelector('#loadingMsg')
    loading.textContent = 'sharing location...'


    if (!navigator.geolocation) {
        return alert('geolocation is not supported bty yuor browser')
    }
    $shareLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(({ coords }) => {

        socket.emit('location', {
            longitude: coords.longitude,
            latitude: coords.latitude,
        }, () => {
            loading.textContent = ''
            $shareLocation.removeAttribute('disabled')
            console.log('Location shared!')
        })

    })
})

socket.on('locationMsg', ({ username, url }) => {

    const html = Mustache.render(locationTemplate, {
        url,
        created: moment(url.created).format('h:mm a'),
        username,
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})


