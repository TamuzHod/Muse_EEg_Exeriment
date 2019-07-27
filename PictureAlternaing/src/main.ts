// tslint:disable:no-console
import { channelNames, EEGReading, MuseClient } from './../../src/muse';
(window as any).connect = async () => {
    const graphTitles = Array.from(document.querySelectorAll('.electrode-item h3'));
    const canvases = Array.from(document.querySelectorAll('.electrode-item canvas')) as HTMLCanvasElement[];
    const canvasCtx = canvases.map((canvas) => canvas.getContext('2d'));
    setImageVisible("catImag", false)

    graphTitles.forEach((item, index) => {
        item.textContent = channelNames[index];
    });
    
    function plot(reading: EEGReading) {
        const canvas = canvases[reading.electrode];
        const context = canvasCtx[reading.electrode];
        if (!context) {
            return;
        }
        const width = canvas.width / 12.0;
        const height = canvas.height / 2.0;
        context.fillStyle = 'green';
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < reading.samples.length; i++) {
            const sample = reading.samples[i] / 15.;
            if (sample > 0) {
                context.fillRect(i * 25, height - sample, width, sample);
            } else {
                context.fillRect(i * 25, height, width, -sample);
            }
        }
    }
    var gameLength = 20
    var imageCount = 0
    var eegReadings = []
    var telemetryData = []
    var accelerometerData = []
    var deviceInfoData = []
    var eventData = []
    document.getElementById("start").addEventListener("click", startRecording);
    document.getElementById("stop").addEventListener("click", stopRecording);
    var recording = false
    var counter=0
    var stimulyData = []
    var stimuly = 0
    var rest = false
    var triggerCount = 0;
    
    var snakes = ["https://i1.wp.com/www.rocksnake.ca/wp-content/uploads/2018/05/cropped-snake.png",
                 "https://dw8stlw9qt0iz.cloudfront.net/IN-4Mwiyley4THaPOrPaMbPat7g=/2000x2000/filters:format(jpeg):quality(75)/curiosity-data.s3.amazonaws.com/images/content/thumbnail/standard/00488f36-654b-4095-e4e3-13256b373232.png?fbclid=IwAR18ql4vYsuaLGNjqoqDSRBf1B1gY9ocMe8IGzxVzSNGqXCG5wgFllc8-DY",
                 "https://www.thoughtco.com/thmb/XR9tX9AK3Pji2Xzr3sWV04mc1ns=/1000x1000/smart/filters:no_upscale()/rattlesnake-5ac0182404d1cf0037919296.jpg",
                 "https://d.newsweek.com/en/full/1506593/snake-cobra-stock-getty.jpg?w=1600&h=1600&q=88&f=2f5a0126a1ae434b6e6a3691e643d496",
                 "https://www.familyhandyman.com/wp-content/uploads/2018/09/How-to-Avoid-Snakes-Slithering-Up-Your-Toilet-shutterstock_780480850-1.jpg"]
    
    var cats = [
        "https://www.petsfriendsunnyvale.com/storage/app/media/bigstock-British-Longhair-Cat--Months-10206431.jpg", 
        "http://image10.zibster.com/5382/14_20190709094158_8966617_large.jpg", "https://www.catit.com/wp-content/uploads/2018/06/Training-your-cat-1.jpg", 
        "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67384874_276809626522051_554022455874682880_n.jpg?_nc_cat=104&_nc_oc=AQnpmC__3D93bF44HTniGhNONFNrvj6El-j8IWpocECURuTMJZsOecsogBtcr_Sz6P1ZIJpLgKXOtkRHyTfAbfYz&_nc_ht=scontent-lax3-1.xx&oh=480fe76c750ace4d62f3c43fa8e401f9&oe=5DB0C334",
        "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67194052_471913913598906_1643797032013398016_n.jpg?_nc_cat=110&_nc_oc=AQneYJc7dRVklp38YcQ5wdVhSt3_MP71qlFxB7DdRrQ6mWkMPsPqYMQycZSyD6PmLE0DLIroMDYd-NFcq811ryei&_nc_ht=scontent-lax3-1.xx&oh=5e06c8f397d1aecbf0935bafc0b209a1&oe=5DAAD296",
        "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67457292_494025301414467_4779392516967366656_n.jpg?_nc_cat=103&_nc_oc=AQmaLlsqqPAQeGq1Ihj01Wkms0NRedzEM73GVEiyGoPDTEyyOIc2k4lb34I7EajpKQGwahtpVM4MXM8_nXY9TozI&_nc_ht=scontent-lax3-1.xx&oh=bf1a9a7835bc9b64724e3996df4cab96&oe=5DAD6211",
        "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67531589_641769992993460_6611719792728473600_n.jpg?_nc_cat=101&_nc_oc=AQkbPyT7VDas09lO8s8V804uknE3IHqAorc1oueiTykSC8chkjEvKbzygrU2d6SJPGONpyQ6_WY46xcaDfEW0k-f&_nc_ht=scontent-lax3-1.xx&oh=1af3c6a7ba8a56157e46e0ecd880df0f&oe=5DAFE7BC",
        "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67323376_707175029710349_3159241848308891648_n.jpg?_nc_cat=105&_nc_oc=AQlFtI_G6CpQTSDTWWBo9sbQyIDpeUJZbn-y5xAB7vu8s7816rinbMlwyRL79vNQy5Dk1UDVbOPZc28DZbKtb8Ep&_nc_ht=scontent-lax3-1.xx&oh=bbfa0be692b1ec6531362bf59b5236fb&oe=5DEEB174", 
    "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67413507_1108820855971491_5874145952339591168_n.jpg?_nc_cat=103&_nc_oc=AQlh-ltvTJ07O46Jn54W82jGJuUyXGk2EZUVLpM3fXukUtyfdp_dbncXOIk-t11_Yceic5mbaCNm3Bfdrrig0zT3&_nc_ht=scontent-lax3-1.xx&oh=cafece3d876169a8c1e4bdcc46aae387&oe=5DE701B7",
    "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67442713_1283462435166020_1911373597633413120_n.jpg?_nc_cat=108&_nc_oc=AQnpzDwABjTLTxROQg3WI-squhvn-53SVCjFFqxFk8s0f2IN2-EjR2aCdJtpTpnWsLuP_aOhGbgy-OvqSBd88MVq&_nc_ht=scontent-lax3-1.xx&oh=4ed178abbf7b913a2425b1225b5e6112&oe=5D9FCDE1", 
    "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67075920_1500789060062790_4000837146612072448_n.jpg?_nc_cat=101&_nc_oc=AQkbDXr9y0voyuqScovm8hdhx3Yu49Jhhn5i3U0wF7iSe_O-LaaIG7SlNogQfIH4Pvw4zEQ0qqA6LzigOhDPIWod&_nc_ht=scontent-lax3-1.xx&oh=bb52808ae47ba94fbb29d90adc608db2&oe=5DE1E806",
    "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67662873_2256054821160167_197237164658917376_n.jpg?_nc_cat=103&_nc_oc=AQnp1z_z6eg8-u71NL_w3Vr6lX7JHkwQH-GmeCt-BjHdt3VeMPM9_A3qJXoddjY-2KyVlteW9wG35Pl-x43YJGTM&_nc_ht=scontent-lax3-1.xx&oh=e71e16a2db94c81d1dc02d6bd9bd7526&oe=5DE77CAC",
        "https://scontent-lax3-1.xx.fbcdn.net/v/t1.15752-9/67213162_2444736042259962_4182326727780859904_n.png?_nc_cat=101&_nc_oc=AQkbIC-F2x_9f-KN_PF--4Duwiag-PsshcKSAHeQD3tPgYVFgcAk_NfGWFF31ZHe5yvtPNtnl27z5SfF_YW3Bior&_nc_ht=scontent-lax3-1.xx&oh=12309533016e8f110dc64a201c854bfa&oe=5DEABF40"
    ]
    
    function startRecording() {
        recording = true
        //setImageVisible("catImag", true)
    }
    var gameOverImage = "https://image.freepik.com/free-vector/game-background_23-2148080814.jpg"
    function stopRecording() {
        recording = false;
        setImageVisible("catImag", false)
        let eegJson = JSON.stringify(eegReadings);
        let telemetryJson = JSON.stringify(telemetryData);
        let accelerometerJson = JSON.stringify(accelerometerData);
        let deviceInfoJson = JSON.stringify(deviceInfoData);
        let eventJson = JSON.stringify(eventData);

        console.log(eegJson);
        console.log(eventJson);


    }
    
    var suppressNextImage = false
    function nextImage(id, index) {
        var img = document.getElementById(id);
        img.src = cats[index];
    }
    
    function setImageVisible(id, visible) {
        var img = document.getElementById(id);
        img.style.visibility = (visible ? 'visible' : 'hidden');
    }

    const client = new MuseClient();
    client.connectionStatus.subscribe((status) => {
        console.log(status ? 'Connected!' : 'Disconnected');
    });
    
    try {
        client.enableAux = true;
        await client.connect();
        await client.start();
        document.getElementById('headset-name')!.innerText = client.deviceName;
        
        client.eventMarkers.subscribe((event) => {
            if(recording) {
                eventData.push(event)
        });
        client.eegReadings.subscribe((reading) => {
            if(recording) {
                counter++
                if (rest && (counter-1000) > 0) {
                    counter = 0;
                    setImageVisible("catImag", true);
                    stimulyData.push({"picIndex" : stimuly, "timeStamp" : recording.timestamps});
                    client.injectMarker(stimuly)
                    rest = false;
                    triggerCount++;
                    if(triggerCount > 4) {
                        cats = cats.concat(snakes);
                    }
                } 
                if(!rest && (counter-200) > 0) {
                    counter = 0;
                    if(!suppressNextImage){
                        stimuly = Math.floor(Math.random() * cats.length);
                        nextImage("catImag", stimuly);
                        suppressNextImage = true;
                        imageCount++;
                        if(imageCount == gameLength)
                            stopRecording();
                            
                    } else 
                        suppressNextImage = false;
                    
                    setImageVisible("catImag", false);
                    rest = true;
                }
                eegReadings.push(reading);
            }
            else 
                plot(reading);
            
        });
        client.telemetryData.subscribe((reading) => {
            telemetryData.push(reading)
            document.getElementById('temperature')!.innerText = reading.temperature.toString() + '℃';
            document.getElementById('batteryLevel')!.innerText = reading.batteryLevel.toFixed(2) + '%';
        });
        client.accelerometerData.subscribe((accel) => {
            const normalize = (v: number) => (v / 16384.).toFixed(2) + 'g';
            if(recording)
                 accelerometerData.push(accel)
            document.getElementById('accelerometer-x')!.innerText = normalize(accel.samples[2].x);
            document.getElementById('accelerometer-y')!.innerText = normalize(accel.samples[2].y);
            document.getElementById('accelerometer-z')!.innerText = normalize(accel.samples[2].z);
        });
        await client.deviceInfo().then((deviceInfo) => {
            deviceInfoData.push(deviceInfo)
            document.getElementById('hardware-version')!.innerText = deviceInfo.hw;
            document.getElementById('firmware-version')!.innerText = deviceInfo.fw;
        });
    } catch (err) {
        console.error('Connection failed', err);
    }
};

