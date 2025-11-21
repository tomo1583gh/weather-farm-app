// test-fetch.mjs
const url = "https://api.open-meteo.com/v1/forecast?latitude=34.65&longitude=138.85&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FTokyo";

async function main() {
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("status:", res.status);
  const json = await res.json();
  console.log("current:", json.current_weather);
}

main().catch((err) => {
  console.error("fetch failed:", err);
});
