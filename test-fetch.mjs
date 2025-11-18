const LAT = 34.65;
const LON = 138.85;

const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FTokyo`;

console.log("URL:", url);

try {
  const res = await fetch(url);
  console.log("status:", res.status);
  const data = await res.json();
  console.log("current temp:", data.current_weather.temperature);
} catch (e) {
  console.error("node fetch error:", e);
}
