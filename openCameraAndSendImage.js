let player = document.getElementById('player');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let csrftoken = getCookie('csrftoken');

const message = document.getElementById('message');
const button = document.getElementById('submitBtn');
const file = document.getElementById('file');
const dropArea = document.getElementById('drag-area');
const imageView = document.getElementById('img-view');

button.addEventListener('click', function () {
    if (file.files.length === 0) {
        console.log('No File selected, Please select a file!');
    } else {
        message.innerHTML = 'Processing Image....';
        console.log('Processing Image....');
    }
});
file.onchange = function (e) {
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('start-camera').disabled = true;
}

file.addEventListener('change', uploadImage);
function uploadImage() {
    file.files[0];
    let imgLink = URL.createObjectURL(file.files[0]);
    imageView.style.backgroundImage = `url(${imgLink})`;
    imageView.textContent = '';
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.getElementById('start-camera').addEventListener('click', function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } }, audio: false })
        .then(function (stream) {
            let player = document.getElementById('player');
            player.srcObject = stream;
        })
        .catch(function (err) {
            console.error('Error accessing the camera: ', err);
        });
    let elements = ['capture', 'player', 'img-view', 'start-camera'];

    elements.forEach(id => {
        let element = document.getElementById(id);
        if (element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });

});
document.getElementById('submitBtn2').addEventListener('click', function captureAndSendImage() {
    let elements = ['result'];
    elements.forEach(id => {
        let element = document.getElementById(id);
        if (element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
    let imageDataURL = canvas.toDataURL('image/jpeg');
    var imageDataSplit = imageDataURL.split(',');
    var imageData = imageDataSplit[1];
    console.log('Image Data:', imageData);
    console.log('CSRFToken:', csrftoken);

    let formData = new FormData();
    formData.append('image_base64', imageData);
    fetch('/imagePage/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Failed to upload audio file');
            }
        })
        .then(data => {
            debugger;
            // ใช้ DOM manipulation เพื่อดึงข้อมูลที่ต้องการจากข้อความ HTML
            const parser = new DOMParser();
            const htmlDocument = parser.parseFromString(data, 'text/html');
            const predictionElement = htmlDocument.getElementById('prediction');
            const predictionData = predictionElement.textContent.trim();
            // อัปเดตข้อมูลในหน้าเว็บเพจ
            document.getElementById('prediction').textContent = predictionData;
            document.getElementById('submitBtn2').disabled = true;
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('capture').addEventListener('click',
    function stopCamera() {
        let player = document.getElementById('player');
        context.drawImage(player, 0, 0, canvas.width, canvas.height);
        let stream = player.srcObject;
        let tracks = stream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        player.srcObject = null;
        let elements = ['canvas', 'player', 'capture', 'submitBtn2', 'submitBtn'];
        elements.forEach(id => {
            let element = document.getElementById(id);
            if (element.style.display === 'none') {
                element.style.display = 'block';
                element.disabled = false;
            } else {
                element.style.display = 'none';
            }
        });
    });