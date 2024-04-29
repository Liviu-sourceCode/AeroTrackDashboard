
(function() {
    // Afisarea mesajelor de consola intr-o caseta de text
    let consoleOutput = document.getElementById('console-output');
    let oldLog = console.log;
    console.log = function() {
        let message = Array.prototype.join.call(arguments, ' ');
        let para = document.createElement('p');
        para.textContent = message;
        consoleOutput.appendChild(para);
        oldLog.apply(console, arguments);

          // Scroll automat catre partea de jos
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    };

    // Afisarea erorilor intr-o caseta de text
    window.addEventListener('error', function(event) {
        let message = event.message;
        let para = document.createElement('p');
        para.textContent = 'EROARE: ' + message;
        para.classList.add('error-message');
        consoleOutput.appendChild(para);
       // oldLog.apply(console, arguments);

         // Scroll automat catre partea de jos
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    });
})();


// Creeaza un nou client MQTT Paho
let mqttClient = new Paho.MQTT.Client("wss://yourClusterURL.s1.eu.hivemq.cloud:port/mqtt", "yourClientId");

// Seteaza optiunile pentru autentificare
let options = {
    userName: '<yourUserName>',
    password: '<yourPassword>',
    onSuccess: onConnect,
    onFailure: function(errorMessage) {
        console.log("Conectare eșuată: " + errorMessage.errorMessage);
    }
};

// Conectare la broker cu optiunile de autentificare
mqttClient.connect(options);

 let isConnected = false;

 function onConnect() {

    console.log("Conectat la brokerul MQTT!");

    isConnected = true;
    const button = document.getElementById('flightButton');

    if(button.style.backgroundColor === 'green'){

        console.log('Zborul este pornit!');
      } else {
    
        console.log('Zborul este oprit!');
      }

    mqttClient.subscribe("topic/speed");
    mqttClient.subscribe("topic/altitude");
    mqttClient.subscribe("topic/direction");
}

// Functia pentru publicarea datelor
function publishData() {
    if (mqttClient && isConnected) {
        const speed = generateSpeed();
        const altitude = generateAltitude();
        const direction = generateDirection();

        console.log('Zborul este pornit!');

        mqttClient.send('topic/speed', speed.toString());
        mqttClient.send('topic/altitude', altitude.toString());
        mqttClient.send('topic/direction', direction.toString());
        
    } else {
        console.error('Clientul MQTT nu este conectat sau zborul nu este pornit!');
    }
}

// Functia pentru gestionarea mesajelor primite
function onMessageArrived(message) {

        const button = document.getElementById('flightButton');

    // Verifica starea butonului si a conexiunii MQTT 
    if (button.style.backgroundColor === 'green' && isConnected) {
        // Actualizeaza interfata cu valorile primite, în functie de topic
        switch (message.destinationName) {
            case 'topic/speed':
                document.getElementById('speed').textContent = message.payloadString;
                break;
            case 'topic/altitude':
                document.getElementById('altitude').textContent = message.payloadString;
                break;
            case 'topic/direction':
                document.getElementById('direction').textContent = message.payloadString;
                break;
            default:
                console.log('Topic necunoscut:', message.destinationName);
        }
    }

    // Functie pentru a obtine unitatea de masura în functie de topic
function getUnit(topic) {
    switch (topic) {
        case 'topic/speed':
            return 'km/h';
        case 'topic/altitude':
            return 'm';
        case 'topic/direction':
            return '°';
        default:
            return '';
    }}

    console.log(`${message.destinationName}: ${message.payloadString}  ${getUnit(message.destinationName)}`);
}

// Inregistrarea functiei onMessageArrived() ca handler pentru evenimentul de sosire a mesajului
mqttClient.onMessageArrived = onMessageArrived; 

let intervalId; // Variabila pentru a stoca ID-ul intervalului

// Functia pentru starea zborului si afisarea datelor
    function toggleColor() {
        const button = document.getElementById('flightButton');
        if (button.style.backgroundColor === 'green') {
            button.style.backgroundColor = 'red';
            byDefault();
            clearInterval(intervalId); // Opreste generarea de date in fundal
            console.log('Zborul este oprit!');
        } else {
            button.style.backgroundColor = 'green';
            intervalId = setInterval(publishData, 3000);
            console.log('Zborul este pornit!');
        }
    }
    
    
// Functia pentru resetarea interfetei la valorile implicite
function byDefault() {
    document.getElementById('speed').textContent = '---';
    document.getElementById('altitude').textContent = '---';
    document.getElementById('direction').textContent = '---';
}

// Functii pentru generarea datelor
function generateSpeed() {
    const speed = Math.floor(Math.random() * (800 - 300 + 1) + 300);
    return speed;
}

function generateAltitude() {
    const altitude = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
    return altitude;
}

function generateDirection() {
    const direction = Math.floor(Math.random() * 360);
    return direction;
}

 
function resetConsole() {

   const consoleElement = document.getElementById('console-output');
   consoleElement.innerHTML = '';

   if(mqttClient && isConnected) {
    
        onConnect();
   } else {
    console.log('Nu sunteti conectat la brokerul MQTT!');
   }
}
