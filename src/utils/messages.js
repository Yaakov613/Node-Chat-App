const generateMessage = (username,text) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

const generateLocationMessage = (username,latitude,longitude)=>{
    return{
        url:`https://google.com/maps?q=${latitude},${longitude}`,
        created: new Date().getTime(),
        username,
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}