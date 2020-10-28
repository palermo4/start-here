async function initAWS () {
    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = "us-east-1"; 
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: config.IDENTITY_POOL_ID
    });  
    return "AWS credentials initialized"
}

// initialize AWS credentials
initAWS().then(console.log); 
const voiceConfig = {
    OutputFormat: "mp3",
    SampleRate: "16000",
    Text: "",
    TextType: "text",
    VoiceId: "Matthew"
}; 
const polly  = new AWS.Polly({apiVersion: '2016-06-10'});
const pollySigner = new AWS.Polly.Presigner(voiceConfig, polly);
const theVoice = new Audio();

function speak(speech,voice) {
    voice && (voiceConfig.VoiceId = voice);
    voiceConfig.Text = speech;
    pollySigner.getSynthesizeSpeechUrl(voiceConfig, (error, url) => {
        if (error) {
            console.log(error);
        } else {
            theVoice.src=url;
            theVoice.play();
        }
    });
}