
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
