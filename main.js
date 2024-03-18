const SETTINGS = {
    github: {
        userName: "jyhyun1008",
        repositoryName: "obstomisskey"
    },
    misskey: {
        host: "i.peacht.art",
        noteText: ":peachtart_hiyuno: **방송 알림!**\n\n히유노는 지금 [치지직]({url})에서 일하고 있어요!\n\n#두유노히유노",
        visibility: "public", //"public" "home" "followers" "specified"
        intervalHour: 1,
    },
    live: { //twitch, youtube, chzzk,... whatever
        url: "https://chzzk.naver.com/1bba9a34d4d2b8b998c36c5cdbc9f4fe"
    }
}

let note

function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {}
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0].replace(/\?/g, "")] = decodeURIComponent(p[1]);
    }
    return b
}

var qs = getQueryStringObject()

const accessToken = qs.token
const appSecret = qs.secret

if (accessToken && appSecret) {
    const i = CryptoJS.SHA256(accessToken + appSecret).toString(CryptoJS.enc.Hex)
    console.log(i)

    const noteUrl = 'https://'+SETTINGS.misskey.host+'/api/notes/create'
    const noteText = SETTINGS.misskey.noteText.replace('{url}', SETTINGS.live.url)
    const noteParam = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            i: i,
            text: noteText,
            visibility: SETTINGS.misskey.visibility
        }),
        credentials: 'omit'
    }

    function sendNote() {
        fetch(noteUrl, noteParam)
        .then((resultData) => {return resultData.json()})
        .then(result)
        .catch(err => { 
            document.querySelector('body').innerHTML += '<div>먼지몰라두 망해써여...힝</div>'
         })
    }

    window.addEventListener('obsRecordingStarting', function(event) {
        fetch(noteUrl, noteParam)
        .then((resultData) => {return resultData.json()})
        .then((result) => {
            note = setInterval(sendNote, SETTINGS.misskey.intervalHour*3600*1000)
        })
        .catch(err => { 
            document.querySelector('body').innerHTML += '<div>먼지몰라두 망해써여...힝</div>'
         })
        
    })

    window.addEventListener('obsRecordingStopping', function(event) {
        clearInterval(note)
    })
}

const isNew = qs.newbie;
if (isNew) {
    const appCreateUrl = 'https://'+SETTINGS.misskey.host+'/api/app/create'
    const appCreateParam = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            name: "obstomisskey",
            description: "make obs to note on misskey",
            permission: ["write:notes"],
            callbackUrl: 'https://' + window.location.host + window.location.pathname
        })
    }
    fetch(appCreateUrl, appCreateParam)
    .then((createdAppData) => {return createdAppData.json()})
    .then((createdAppRes) => {
        if (createdAppRes.secret) {
            var appSecret = createdAppRes.secret
    
            localStorage.setItem('appSecret', appSecret);
    
            const generateSessionUrl = 'https://'+SETTINGS.misskey.host+'/api/auth/session/generate'
            const generateSessionParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    appSecret: appSecret
                })
            }
    
            fetch(generateSessionUrl, generateSessionParam)
            .then((sessionData) => {return sessionData.json()})
            .then((sessionRes) => {
                if (sessionRes.url) {
                    var authUrl = sessionRes.url
                    location.href = authUrl
                }
            })
            .catch((error) => console.log(error));
        }
    })
    .catch((error) => console.log(error));
}