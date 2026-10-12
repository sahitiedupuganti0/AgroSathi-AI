
const form = document.getElementById("cropForm");
const result = document.getElementById("result");

const cropNames = {
  rice: "Rice",
  cotton: "Cotton",
  tomato: "Tomato",
  chilli: "Chilli",
  other: "Unspecified crop"
};

// These are preliminary prompts for investigation,
// not confirmed diagnoses of crop disease.
const guidance = {
  yellow: {
    title: "Yellow leaves: investigate the cause",
    cause: "Yellowing can be associated with nutrient problems, water stress, root damage or disease.",
    actions: [
      "Check whether the soil is too wet or too dry.",
      "Inspect both sides of leaves and examine affected and healthy plants.",
      "Consider a soil test before applying fertilizer.",
      "Seek crop-specific advice from a local agricultural expert if the problem spreads."
    ]
  },
  spots: {
    title: "Leaf spots: inspect the affected plants",
    cause: "Spots may be caused by fungal or bacterial diseases, pests or non-infectious damage.",
    actions: [
      "Photograph the spots and inspect nearby plants for similar symptoms.",
      "Avoid unnecessary leaf wetting and follow appropriate field hygiene practices.",
      "Do not apply a pesticide until the likely cause has been checked.",
      "Consult a local agricultural expert for identification."
    ]
  },
  wilting: {
    title: "Wilting: check water and roots",
    cause: "Wilting may result from water shortage, waterlogged roots, root damage or disease.",
    actions: [
      "Check soil moisture around the roots.",
      "Look for standing water and inspect roots where practical.",
      "Avoid adding more water until you understand the soil conditions.",
      "Seek expert advice if plants remain wilted despite suitable moisture."
    ]
  },
  pests: {
    title: "Possible pest damage: monitor the field",
    cause: "Visible insects or feeding damage may indicate pests, but not all insects are harmful.",
    actions: [
      "Take a clear photograph of the insect and the damage.",
      "Inspect several plants to understand how widespread the problem is.",
      "Protect beneficial insects and consider integrated pest management.",
      "Use only locally recommended, crop-specific controls after identification."
    ]
  },
  other: {
    title: "More information is needed",
    cause: "The available information is not sufficient to identify the cause.",
    actions: [
      "Record the crop, growth stage and when the problem started.",
      "Take clear photographs of the whole plant and affected leaves.",
      "Check soil moisture and inspect nearby plants.",
      "Ask a qualified local agricultural expert for help if the problem continues."
    ]
  }
};

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const crop = document.getElementById("crop").value;
  const stage = document.getElementById("stage").value;
  const symptom = document.getElementById("symptom").value;
  const details = document.getElementById("details").value.trim();

  if (!crop || !stage || !symptom) {
    alert("Please complete all required fields.");
    return;
  }

  const advice = guidance[symptom];

  result.replaceChildren();

  function addText(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    result.appendChild(element);
    return element;
  }

  addText("h3", advice.title);
  addText("p", "Crop: " + cropNames[crop]);
  addText("p", "Growth stage: " + stage);
  addText("p", "Possible explanation: " + advice.cause);
  addText("h4", "Recommended next steps");

  const list = document.createElement("ul");

  advice.actions.forEach(function (action) {
    const item = document.createElement("li");
    item.textContent = action;
    list.appendChild(item);
  });

  result.appendChild(list);

  if (details) {
    addText("p", "Your observation: " + details);
  }

  addText(
    "p",
    "Note: This is general guidance, not a confirmed diagnosis. " +
    "Verify crop-specific recommendations with a qualified agricultural expert."
  );

  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

const weatherForm = document.getElementById("weatherForm");
const weatherResult = document.getElementById("weatherResult");

weatherForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const location = document.getElementById("location").value.trim();

  weatherResult.hidden = false;
  weatherResult.textContent = "Fetching weather data...";

  try {
    // Find the location's coordinates
    const geoUrl =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(location) +
      "&count=1&language=en&format=json";

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Could not search for this location.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Location not found. Try a nearby city.");
    }

    const place = geoData.results[0];

    // Get current weather and a three-day forecast
    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + place.latitude +
      "&longitude=" + place.longitude +
      "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code" +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&forecast_days=3&timezone=auto";

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Could not retrieve weather data.");
    }

    const data = await weatherResponse.json();
    const current = data.current;
    const daily = data.daily;

    // Build the result safely
    weatherResult.replaceChildren();

    function addWeatherText(tag, text) {
      const element = document.createElement(tag);
      element.textContent = text;
      weatherResult.appendChild(element);
    }

    addWeatherText(
      "h3",
      "Weather in " + place.name +
      (place.admin1 ? ", " + place.admin1 : "")
    );

    addWeatherText(
      "p",
      "Temperature: " + current.temperature_2m +
      " °C"
    );

    addWeatherText(
      "p",
      "Relative humidity: " +
      current.relative_humidity_2m + "%"
    );

    addWeatherText(
      "p",
      "Current precipitation: " +
      current.precipitation + " mm"
    );

    addWeatherText("h4", "Three-day forecast");

    const list = document.createElement("ul");

    for (let i = 0; i < daily.time.length; i++) {
      const item = document.createElement("li");

      item.textContent =
        daily.time[i] +
        ": " + daily.temperature_2m_min[i] + "–" +
        daily.temperature_2m_max[i] + " °C; " +
        "maximum precipitation probability: " +
        (daily.precipitation_probability_max[i] ?? "N/A") + "%";

      list.appendChild(item);
    }

    weatherResult.appendChild(list);

    addWeatherText(
      "p",
      "Use this forecast alongside field conditions. " +
      "Check crop-specific guidance before irrigation or spraying."
    );

    addWeatherText(
      "small",
      "Forecast retrieved: " +
      new Date().toLocaleString()
    );

  } catch (error) {
    weatherResult.replaceChildren();

    const message = document.createElement("p");
    message.textContent =
      error.message +
      " Check your internet connection and try again.";

    weatherResult.appendChild(message);
  }
});

const sustainableForm =
  document.getElementById("sustainableForm");

const sustainableResult =
  document.getElementById("sustainableResult");

const sustainableTips = {
  soil: {
    title: "Build healthier soil",
    tips: [
      "Consider soil testing before making fertilizer decisions.",
      "Use suitable compost or well-decomposed organic matter where appropriate.",
      "Consider crop rotation with locally suitable crops.",
      "Reduce unnecessary soil disturbance where practical."
    ]
  },

  water: {
    title: "Use water more efficiently",
    tips: [
      "Check soil moisture before deciding whether to irrigate.",
      "Consider drip irrigation for suitable crops and field conditions.",
      "Use mulch where appropriate to help reduce evaporation.",
      "For rice, follow locally recommended water-management practices."
    ]
  },

  pests: {
    title: "Manage pests responsibly",
    tips: [
      "Inspect plants regularly and record pest levels.",
      "Identify the pest before choosing a control method.",
      "Protect beneficial insects and consider integrated pest management.",
      "Use only locally recommended controls when needed."
    ]
  },

  nutrition: {
    title: "Improve nutrient management",
    tips: [
      "Use soil-test results to guide nutrient applications.",
      "Consider compost and other suitable organic inputs.",
      "Avoid applying more fertilizer than the crop requires.",
      "Choose nutrient timing and amounts according to crop needs."
    ]
  }
};

sustainableForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const goal = document.getElementById("farmGoal").value;
  const crop = document.getElementById("farmCrop").value;
  const advice = sustainableTips[goal];

  if (!advice || !crop) {
    sustainableResult.hidden = false;
    sustainableResult.textContent =
      "Please select a goal and crop.";
    return;
  }

  sustainableResult.replaceChildren();

  function addTipText(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    sustainableResult.appendChild(element);
    return element;
  }

  addTipText("h3", advice.title);
  addTipText(
    "p",
    "Selected crop: " +
    crop.charAt(0).toUpperCase() + crop.slice(1)
  );

  const list = document.createElement("ul");

  advice.tips.forEach(function (tip) {
    const item = document.createElement("li");
    item.textContent = tip;
    list.appendChild(item);
  });

  sustainableResult.appendChild(list);

  addTipText(
    "p",
    "These are general sustainable farming suggestions. " +
    "Adapt them to your crop, soil, climate and local agricultural advice."
  );

  sustainableResult.hidden = false;
  sustainableResult.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

const voiceLanguage = document.getElementById("voiceLanguage");
const startVoice = document.getElementById("startVoice");
const voiceStatus = document.getElementById("voiceStatus");
const voiceInput = document.getElementById("voiceInput");
const getVoiceAdvice = document.getElementById("getVoiceAdvice");
const voiceResult = document.getElementById("voiceResult");
const speakAdvice = document.getElementById("speakAdvice");
const stopSpeaking = document.getElementById("stopSpeaking");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let currentAdvice = "";

const voiceAdvice = {
  te: {
    yellow: "ఆకులు పసుపు రంగులోకి మారడానికి అనేక కారణాలు ఉండవచ్చు. నేలలో తేమను పరిశీలించండి. అవసరమైతే మట్టి పరీక్ష చేయించండి. సమస్య పెరిగితే వ్యవసాయ నిపుణుడిని సంప్రదించండి.",
    pests: "మొక్కలపై పురుగులను జాగ్రత్తగా పరిశీలించండి. పురుగును సరిగ్గా గుర్తించిన తర్వాతే నియంత్రణ పద్ధతిని ఎంచుకోండి. స్థానిక వ్యవసాయ నిపుణుల సలహా తీసుకోండి.",
    water: "మొక్కలకు నీరు పెట్టే ముందు నేల తేమను పరిశీలించండి. పంట అవసరాలు మరియు వాతావరణ సూచనలను పరిగణనలోకి తీసుకోండి.",
    spots: "ఆకులపై మచ్చలకు అనేక కారణాలు ఉండవచ్చు. ప్రభావిత ఆకులను పరిశీలించండి. సమస్య వ్యాపిస్తే వ్యవసాయ నిపుణుడిని సంప్రదించండి.",
    wilting: "మొక్కలు వాడిపోవడానికి నీటి కొరత, అధిక నీరు లేదా వేర్ల సమస్యలు కారణం కావచ్చు. నేల తేమను పరిశీలించండి.",
    general: "దయచేసి మీ పంట పేరు మరియు సమస్యను మరింత వివరంగా చెప్పండి. అవసరమైతే స్థానిక వ్యవసాయ నిపుణుడి సలహా తీసుకోండి."
  },
  hi: {
    yellow: "पत्तियाँ पीली होने के कई कारण हो सकते हैं। मिट्टी की नमी जाँचें और ज़रूरत पड़ने पर मिट्टी की जाँच करवाएँ। समस्या बढ़े तो कृषि विशेषज्ञ से सलाह लें।",
    pests: "पौधों पर कीटों की जाँच करें। कीट की सही पहचान के बाद ही नियंत्रण का तरीका चुनें। स्थानीय कृषि विशेषज्ञ से सलाह लें।",
    water: "सिंचाई से पहले मिट्टी की नमी जाँचें। फसल की ज़रूरत और मौसम के पूर्वानुमान को ध्यान में रखें।",
    spots: "पत्तियों पर धब्बों के कई कारण हो सकते हैं। प्रभावित पत्तियों की जाँच करें और समस्या फैलने पर कृषि विशेषज्ञ से सलाह लें।",
    wilting: "पौधों के मुरझाने का कारण पानी की कमी, अधिक पानी या जड़ों की समस्या हो सकती है। मिट्टी की नमी जाँचें।",
    general: "कृपया अपनी फसल का नाम और समस्या के बारे में थोड़ा और बताएँ। ज़रूरत पड़ने पर कृषि विशेषज्ञ से सलाह लें।"
  },
  en: {
    yellow: "Yellow leaves can have several causes, including nutrient problems, water stress or disease. Check soil moisture and consider a soil test. Consult a local agricultural expert if the problem spreads.",
    pests: "Inspect the crop and identify the pest before choosing a control method. Consider integrated pest management and ask a local agricultural expert for crop-specific advice.",
    water: "Check soil moisture before irrigation. Consider crop requirements and the weather forecast when planning field activities.",
    spots: "Leaf spots can have several causes. Inspect affected plants and monitor whether the problem spreads. Seek crop-specific expert advice if it worsens.",
    wilting: "Wilting can be associated with too little water, excess water or root problems. Check soil moisture and inspect the plants.",
    general: "Please describe your crop and the problem in more detail. Consult a qualified local agricultural expert if the issue persists."
  }
};

function identifyVoiceTopic(text) {
  const value = text.toLowerCase();

  if (/yellow|పసుపు|पीला|पीली|पीलापन/.test(value)) {
    return "yellow";
  }

  if (/pest|insect|bug|పురుగు|కీట|कीट|कीड़े|कीड़ा/.test(value)) {
    return "pests";
  }

  if (/water|irrigat|నీరు|నీళ్లు|पानी|सिंचाई/.test(value)) {
    return "water";
  }

  if (/spot|lesion|మచ్చ|धब्बे|धब्बा/.test(value)) {
    return "spots";
  }

  if (/wilt|droop|వాడి|మురిగి|मुरझा|मुरझाना/.test(value)) {
    return "wilting";
  }

  return "general";
}

function getSelectedVoiceLanguage() {
  return voiceLanguage.value.split("-")[0];
}

startVoice.addEventListener("click", function () {
  if (!SpeechRecognition) {
    voiceStatus.textContent =
      "Speech recognition is not supported by this browser. " +
      "Try an up-to-date version of Chrome or type your question below.";
    return;
  }

  if (recognition) {
    recognition.abort();
  }

  recognition = new SpeechRecognition();
  recognition.lang = voiceLanguage.value;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = function () {
    voiceStatus.textContent = "Listening... Please speak now.";
    startVoice.disabled = true;
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    voiceInput.value = transcript;
    voiceStatus.textContent = "Speech recognized. You can request advice now.";
  };

  recognition.onerror = function (event) {
    voiceStatus.textContent =
      "Speech recognition error: " + event.error +
      ". You can type your question instead.";
  };

  recognition.onend = function () {
    startVoice.disabled = false;
  };

  try {
    recognition.start();
  } catch (error) {
    voiceStatus.textContent =
      "Could not start the microphone. Please try again.";
    startVoice.disabled = false;
  }
});

getVoiceAdvice.addEventListener("click", function () {
  const question = voiceInput.value.trim();

  if (!question) {
    voiceStatus.textContent = "Please speak or type your farming question first.";
    return;
  }

  const language = getSelectedVoiceLanguage();
  const topic = identifyVoiceTopic(question);
  const languageAdvice = voiceAdvice[language] || voiceAdvice.en;

  currentAdvice = languageAdvice[topic];

  voiceResult.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "Farming guidance";
  voiceResult.appendChild(heading);

  const answer = document.createElement("p");
  answer.textContent = currentAdvice;
  voiceResult.appendChild(answer);

  const note = document.createElement("p");
  note.textContent =
    "This is general guidance based on detected keywords, not a confirmed diagnosis.";
  voiceResult.appendChild(note);

  voiceResult.hidden = false;
  speakAdvice.hidden = false;
  stopSpeaking.hidden = true;
});

speakAdvice.addEventListener("click", function () {
  if (!("speechSynthesis" in window)) {
    voiceStatus.textContent =
      "Speech output is not supported by this browser. Please read the displayed advice.";
    return;
  }
if (!currentAdvice || !currentAdvice.trim()) {
  voiceStatus.textContent = "Please get farming advice first.";
  return;
}
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(currentAdvice);
  const language = getSelectedVoiceLanguage();

  utterance.lang =
    language === "te" ? "te-IN" :
    language === "hi" ? "hi-IN" : "en-IN";

  utterance.onstart = function () {
    voiceStatus.textContent = "Reading the advice aloud...";
    speakAdvice.hidden = true;
    stopSpeaking.hidden = false;
  };

  utterance.onend = function () {
    voiceStatus.textContent = "Finished reading the advice.";
    speakAdvice.hidden = false;
    stopSpeaking.hidden = true;
  };

  utterance.onerror = function () {
    voiceStatus.textContent =
      "Speech playback failed. You can still read the advice on screen.";
    speakAdvice.hidden = false;
    stopSpeaking.hidden = true;
  };
  utterance.rate = 0.9;
utterance.pitch = 1;

setTimeout(function () {
  window.speechSynthesis.speak(utterance);
}, 150);
  window.speechSynthesis.speak(utterance);
});

stopSpeaking.addEventListener("click", function () {
  window.speechSynthesis.cancel();
  speakAdvice.hidden = false;
  stopSpeaking.hidden = true;
  voiceStatus.textContent = "Speech stopped.";
});

voiceLanguage.addEventListener("change", function () {
  window.speechSynthesis?.cancel();
  currentAdvice = "";
  voiceResult.hidden = true;
  speakAdvice.hidden = true;
  stopSpeaking.hidden = true;
  voiceStatus.textContent =
    "Language changed. Speak or type a new question.";
});

const voiceShortcut = document.getElementById("voiceShortcut");
const voiceModal = document.getElementById("voiceModal");
const closeVoice = document.getElementById("closeVoice");

if (voiceShortcut && voiceModal) {
  voiceShortcut.addEventListener("click", () => {
    voiceModal.hidden = false;
  });
}

if (closeVoice && voiceModal) {
  closeVoice.addEventListener("click", () => {
    voiceModal.hidden = true;
    window.speechSynthesis?.cancel();
  });
}

if (voiceModal) {
  voiceModal.addEventListener("click", (event) => {
    if (event.target === voiceModal) {
      voiceModal.hidden = true;
      window.speechSynthesis?.cancel();
    }
  });
}

