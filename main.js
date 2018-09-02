
// Helios_Home_Assistant
// v0.0.1

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

let synth = window.speechSynthesis;

let recognition = new SpeechRecognition();
let speechRecognitionList = new SpeechGrammarList();

recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 5;

let statusLabel = document.querySelector('.state');
let msgBox = document.querySelector('.messages');
let startButton = document.querySelector('.start');
let stopButton = document.querySelector('.stop');

msgBox.scrollTop = msgBox.scrollHeight;

const library = {
  intent: {
    'find me': 'request',
    'help me': 'request',
    'can you': 'request',
    'i': 'statement',
    'where': 'request',
    'did you know': 'query',
    'do you know': 'query',
    'what': 'query',
    'what\'s': 'query'
  },
  context: {
    'my': 'phil',
    'mom\'s': 'mother',
    'mother\'s': 'mother',
    'today': new Date(),
    'tomorrow': getTomorrow(),
  }
}

const personalityGreeting = [
  'Don\'t make a girl wait so long before you talk to her. Anyways. ', 'Oh hey there. ', 'Yes master. '
]

const greetings = [
  'How can I help you', 'How can I help you today', 'What may I help you with', 'What may I help you with today', 'How may I be of service to you?'
]

function getTomorrow() {
  let date = new Date();
  let day;
  if(date.getDay() === 6) {
    day = 0;
  } else {
    day++;
  }
  return new Date(date.getFullYear(), date.getMonth(), day)
}

function addMessageToBox(type, message) {
  if(type === 'helios') {
    message = message + ' <<';
  } else {
    message = '>> ' + message;
  }
  let hr = document.createElement('hr');
  let entry = document.createElement('p');
  entry.classList.add(type);
  entry.innerText = message;
  msgBox.appendChild(entry);
  msgBox.appendChild(hr);
}

function selectGreeting() {
  let toSay = '';
  let coinFlip = Math.random() > .5 ? true : false;
  let randOne = Math.floor(Math.random() * personalityGreeting.length);
  let randTwo = Math.floor(Math.random() * greetings.length);
  if(coinFlip) {
    toSay += personalityGreeting[randOne];
  }
  toSay += greetings[randTwo];
  return toSay
}

function speak(toSay, lang) {
  let voices = synth.getVoices()
  let sayThis = new SpeechSynthesisUtterance(toSay);
  let name = 'Karen';
  if(lang !== undefined) {
    name = 'Yuna'
  }
  voices.forEach(d => {
    if(d.name === name) {
      sayThis.voice = d
    }
  })
  sayThis.pitch = 1.2;
  sayThis.rate = 1;
  synth.speak(sayThis);
}

function activateListenMode(initial) {
  console.log('starting')
  if(initial === 'korean') {
    recognition.abort()
    recognition.lang = 'ko';
  }
  setTimeout(() => {
    msgBox.style.transform = 'scaleX(1) scaleY(0)';

    setTimeout(() => {``
      msgBox.style.transform = 'scaleX(1) scaleY(1)';

      setTimeout(() => {
        localStorage.setItem('calledOn', true);
        if(initial === 'korean') {
          addMessageToBox('helios', '어떻게 도와 드릴까요?');
          recognition.start();
        } else {
          let toSay = selectGreeting();
          addMessageToBox('helios', toSay);
          speak(toSay)
        }

      }, 1250);
    }, 1000);
  });
}

function deactivateListenMode() {
  console.log('closing down');
  setTimeout(() => {
    msgBox.style.transform = 'scaleX(1) scaleY(0.1)';

    setTimeout(() => {
      msgBox.style.transform = 'scaleX(0) scaleY(0)';
    }, 1000)
  })
  localStorage.removeItem('calledOn');
  language = 'en-US';
  while(msgBox.firstChild) {
    msgBox.removeChild(msgBox.firstChild)
  }
}

function shouldRestart() {
  return localStorage.getItem('upState')
}

function checkName(hashObj) {
  const names = [
    'helios', 'chileos', 'chelios', 'korean'
  ];
  let goodName = false;
  for(let i = 0; i < names.length; i++) {
    for(let key in hashObj) {
      if(key.includes(names[i])) {
        goodName = true;
        localStorage.setItem('language', 'english')
      }
    }
  }

  if(goodName === true && hashObj['korean'] !== undefined) {
    goodName = 'korean';
    localStorage.setItem('language', 'korean')
  }
  console.log('goodName', goodName)
  return goodName;
}

function checkStopWord(hashObj) {
  const stopWords = [
    'stop listening', 'hard stop', 'shut down'
  ];
  let hardStop = false;
  for(let i = 0; i < stopWords.length; i++) {
    for(let key in hashObj) {
      if(key.includes(stopWords[i])) {
        hardStop = true;
        localStorage.setItem('upState', false)
      }
    }
  }
  return hardStop;
}

startButton.addEventListener('click', (e) => {
  e.preventDefault();
  // e.stopPropagation();
  localStorage.clear();
  localStorage.setItem('upState', true);
  recognition.start();
})

stopButton.addEventListener('click', (e) => {
  e.preventDefault();
  // e.stopPropagation();
  statusLabel.innerText = 'Status: stopped';
  startButton.classList.remove('selected');
  localStorage.removeItem('calledOn');
  localStorage.setItem('upState', false)
  deactivateListenMode();
  recognition.abort();
})

recognition.onstart = () => {
  statusLabel.innerText = 'Status: Ready';
  startButton.classList.add('selected');
  console.log('Recognition Start');
}

recognition.onaudiostart = (event) => {
  statusLabel.innerText = 'Status: Listening';
  console.log('Audio Start');
}

recognition.onsoundstart = () => {
  statusLabel.innerText = 'Status: Detecting sound...';
  console.log('Sound Start');
}

recognition.onspeechstart = () => {
  statusLabel.innerText = 'Status: Detecting Speech...';
  console.log('Speech Start');
}

recognition.onaudioend = () => {
  statusLabel.innerText = 'Status: Audio Ended';
  // console.log('Audio ended');
}

recognition.onsoundend = () => {
  statusLabel.innerText = 'Status: Sound Ended';
  // console.log('Sound ended');
}

recognition.onspeechend = () => {
  statusLabel.innerText = 'Status: Speech Ended';
  // console.log('Speech ended');
}

recognition.onerror = (event) => {
  // console.log('Error', event.error)
}

recognition.onend = () => {
  statusLabel.innerText = 'Status: Self End';
  startButton.classList.remove('selected');
  // console.log('Self end')
  let language = localStorage.getItem('language')
  if(localStorage.getItem('upState') === 'true' && language === 'english') {
    console.log(localStorage.getItem('upState'))
    recognition.start();
  }
}

recognition.onresult = (event) => {
  let last = event.results.length - 1;
  let resultsObj = event.results[last];
  let resultsHash = {};
  let finalHash = {};
  let counter = 0;
  for(let key in resultsObj) {
    const transcript = resultsObj[key].transcript;
    const confidence = resultsObj[key].confidence
    resultsHash[transcript] = {
      confidence: confidence,
      index: counter
    }
    counter++;
  }

  for(let key in resultsHash) {
    finalHash[key.toLowerCase().trim()] = resultsHash[key];
  }

  console.log(finalHash)

  const hardStop = checkStopWord(finalHash);
  console.log(hardStop)
  const wasICalled = checkName(finalHash);
  console.log(wasICalled)

  let lang = localStorage.getItem('language')
  if(hardStop) {
    stopButton.click();

  } else {
    if(localStorage.getItem('calledOn') === 'true') {
      // discovery(finalHash);
      if(lang !== 'korean') {
        dumbBrain(finalHash)
      } else {
        koreanDumbBrain(finalHash)
      }

    } else {
      if(wasICalled) {
        activateListenMode(wasICalled);
      }
    }
  }
}

function dumbBrain(hash) {
  // hash = trimResults(hash);
  let reply;
  let timeObj;
  console.log(hash)
  let text = hashToString(hash);
  text = text.split('.').join().trim();
  console.log('received', text === 'what time is it');
  addMessageToBox('user', text);

  switch(text) {
    case 'tell me the time':
    case 'tell me what time it is':
      timeObj = currentTime();
      replyShow = `The current time is ${timeObj.timeSay}`
      speak(replyShow);
    case 'what time is it':
    case 'do you know the time':
    case 'do you know what time it is':
    case 'have you got the time':
    case 'do you have the time':
    case 'can you tell me the time':
    case 'show me the time':
    case 'show me what time it is':
      timeObj = currentTime();
      replyShow = `The current time is ${timeObj.timeShow}`
      addMessageToBox('helios', replyShow);
      break;
    case 'is my mother home':
    case 'is my mom home':
    case 'is she in':
    case 'is she currently in':
    case 'is she at home':
    case 'is she home':
    case 'is she currently home':
    case 'is she currently at home':
      fetch('http://67.250.209.166:6001/api/ping', {
        headers: {
          secretHandshake: 'authorized'
        }
      })
      .then(response => response.json())
        .then(data => {
          if(data === 'Yes') {
            addMessageToBox('helios', 'She is currently at home.')
            speak('She is indeed, currently at home');
          } else {
            addMessageToBox('helios', 'She is currently not at home.')
            speak('She currently not in at the moment.');
          }
        })
  }
}

function koreanDumbBrain(hash) {
  let reply;
  let timeObj;
  console.log(hash)
  let text = hashToString(hash);
  text = text.split('.').join().trim();
  console.log('received', text);
  addMessageToBox('user', text);

  switch(text) {
    case '영어':
      console.log('here')
      language = 'en-US';
      recognition.lang = language;
      recognition.abort();
      setTimeout(() => {
        recognition.start()
      }, 1000)
      break;
    case '지금 몇 시지':
      timeObj = currentTime();
      replyShow = `지금은 ${timeObj.timeShow}`
      addMessageToBox('helios', replyShow);
      speak(replyShow, 'korean')
  }
}

function currentTime() {
  let date = new Date();
  let timeShow = date.toLocaleTimeString('en-US');
  let timeSay = date.toLocaleTimeString().split(' ')
  timeSay[0] = timeSay[0].slice(0, -3)
  timeSay = timeSay.join(':').split(':').join(' ');
  let obj = { timeShow, timeSay }
  return obj;
}

function hashToString(hash) {
  for(let key in hash) {
    return key
  }
}

function trimResults(hash) {
  let toDelete = [];
  console.log(hash)
  for(let key in hash) {
    if(hash[key].index > 0) {
      toDelete.push(key)
      hash[key] = hash[key].confidence;
    }
  }
  toDelete.forEach(d => {
    delete hash[d];
  })
}

function makeLeftOver(key, target) {
  let targetLength = target.length;
  let leftOver = key.slice(targetLength);
  return leftOver;
}

function intent() {
  let redo = true;
  let intent = [];
  while(redo === true) {
    redo = false;
    for(let key in hash) {
      for(let i in library.intent) {
        // intent word found
        if(key.slice(0, 11).includes(library.intent[i])) {
          verb = library.intent[i];
          // intent arr doesn't aready have this intent
          if(!intent.includes(library.intent[i])){
            intent.push(library.intent[i]);
          }
          leftOver = makeLeftOver(key, library.intent[i]);
          hash[leftOver] = true;
          redo = true;
        } else {
          delete hash[key];
        }
      }
    }
  }

  return intent;
}

function captureContext() {

}

function discovery(hash) {
  trimResults();

  let intent = [];
  let verb = '';
  let leftOver;
  /////////////////////
  // Discover Intent
  /////////////////////
  intent();

  // Discover what do you want
  if(intent.includes('request')) {

  }
}
























