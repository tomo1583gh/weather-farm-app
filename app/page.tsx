type CurrentWeather = {
  temperature: number; // ℃
  windspeed: number; // km/h
  winddirection: number; // °
  weathercode: number;
  time: string; // ISO文字列
};

type DailyWeather = {
  time: string[]; // 日付配列
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
};

type WeatherResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather: CurrentWeather;
  daily: DailyWeather;
};

const LAT = 34.65; // 南伊豆あたりの緯度（ざっくり）
const LON = 138.85; // 南伊豆あたりの経度（ざっくり）

async function fetchWeather(): Promise<WeatherResponse> {
  /*
  // 本番用（Node の fetch 問題が解決したら戻す）
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FTokyo`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Weather API status:", res.status);
    throw new Error("天気情報の取得に失敗しました");
  }

  return res.json();
  */

  // --- 学習用のダミーデータ（ここだけで完結） ---
  const now = new Date();

  // 7日分のダミーデータを作成
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return d;
  });

  return {
    latitude: LAT,
    longitude: LON,
    timezone: "Asia/Tokyo",
    current_weather: {
      temperature: 18.5,
      windspeed: 3.2,
      winddirection: 180,
      weathercode: 0,
      time: now.toISOString(),
    },
    daily: {
      time: days.map((d) => d.toISOString().slice(0, 10)),
      temperature_2m_max: [21, 19, 20, 18, 17, 19, 22],
      temperature_2m_min: [12, 11, 10, 9, 10, 11, 13],
      precipitation_sum: [1.5, 0, 0, 3.2, 5.1, 0.2, 0],
    },
  };
}

// サーバーコンポーネント
export default async function HomePage() {
  const data = await fetchWeather();

  const current = data.current_weather;
  const todayIndex = 0;
  const todayMax = data.daily.temperature_2m_max[todayIndex];
  const todayMin = data.daily.temperature_2m_min[todayIndex];
  const todayPrecip = data.daily.precipitation_sum[todayIndex];

  const dateStr = new Date(current.time).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // --- 農作業アドバイスの簡単なロジック ---
  const advices: string[] = [];

  // 気温に関するアドバイス
  if (todayMax >= 28) {
    advices.push(
      "最高気温がかなり高めです。潅水を多めにして、作業は朝夕の涼しい時間帯に集中させましょう。"
    );
  } else if (todayMax >= 24) {
    advices.push(
      "日中は少し熱くなりそうです。ハウス内の換気と作業者の熱中症対策を意識しましょう。"
    );
  } else if (todayMax >= 10) {
    advices.push(
      "気温が低めです。防寒対策と、夜間の低温ストレスに注意してください。"
    );
  }

  // 降水量に関するアドバイス
  if (todayPrecip >= 10) {
    advices.push(
      "降水量が多い予報です。排水路の確認や、収穫・出荷のスケジュール調整を検討しましょう。"
    );
  } else if (todayPrecip >= 1) {
    advices.push(
      "にわか雨の可能性があります。屋外資材や機械が濡れないように注意しておきましょう。"
    );
  }

  // 風に関するアドバイス
  if (current.windspeed >= 8) {
    advices.push(
      "やや風が強い一日になりそうです。マルチやビニール、ネット・支柱の固定を再確認しておきましょう。"
    );
  }



  // jsx (returnの中身)
  return (
    <div className="space-y-4 md:space-y-6">
      {/* 現在の天気カード */}
      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold md:text-xl">
              南伊豆の現在の天気
            </h2>
            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              {dateStr} 時点 (Open-Meteo API)
            </p>
          </div>

          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            リアルタイム (SSR)
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* 現在気温 */}
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
            <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
              現在気温
            </div>
            <div className="text-3xl font-bold md:text-4xl">
              {current.temperature.toFixed(1)}
              <span className="text-lg">℃</span>
            </div>
          </div>

          {/* 最高 / 最低 */}
          <div className="flex flex-col justify-center rounded-lg bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium text-slate-500">
              今日の予想気温
            </div>
            <div className="mt-1 text-lg font-semibold md:text-xl">
              最高 {todayMax.toFixed(1)}℃ / 最低 {todayMin.toFixed(1)}℃
            </div>
          </div>

          {/* 降水量 */}
          <div className="flex flex-col justify-center rounded-lg bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium text-slate-500">
              今日の合計降水量（合計）
            </div>
            <div className="mt-1 text-lg font-semibold md:text-xl">
              {todayPrecip.toFixed(1)} mm
            </div>
          </div>

          {/* 風 */}
          <div className="flex flex-col justify-center rounded-lg bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium text-slate-500">風</div>
            <div className="mt-1 text-lg font-semibold md:text-xl">
              {current.windspeed.toFixed(1)} km/h
            </div>
            <div className="text-xs text-slate-500">
              風向 {current.winddirection.toFixed(0)}°
            </div>
          </div>
        </div>
      </section>

      {/* 週間予報カード */}
      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold md:text-lg">
              週間予報（ダミーデータ）
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              ※ 今はモックデータ。あとで API / ISR に差し替え予定。
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:gap-3">
          {data.daily.time.map((dStr, index) => {
            const label = new Date(dStr).toLocaleDateString("ja-JP", {
              month: "numeric",
              day: "numeric",
              weekday: "short",
            });

            const max = data.daily.temperature_2m_max[index];
            const min = data.daily.temperature_2m_min[index];
            const prec = data.daily.precipitation_sum[index];

            return (
              <div
                key={dStr}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 md:px-4 md:py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 md:text-base">
                    {label}
                  </span>
                  {index === 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      今日
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs md:text-sm">
                  <span>
                    最高{" "}
                    <span className="font-semibold">
                      {max.toFixed(1)}℃
                    </span>
                  </span>
                  <span>
                    最低{" "}
                    <span className="font-semibold">
                      {min.toFixed(1)}℃
                    </span>
                  </span>
                  <span className="text-sky-700">
                    降水 {prec.toFixed(1)} mm
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 今日の農作業メモ (ロジック版) */}
      <section className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 md:p-5">
        <h3 className="text-sm font-semibold text-emerald-900 md:text-base">
          今日の農作業メモ
        </h3>
        <p className="mt-1 text-xs text-emerald-800/80">
          ※ 気温・降水量・風の条件から、簡単なアドバイスを自動生成しています（学習用）。
        </p>
        {advices.length === 0 ? (
          <p className="mt-3 text-sm text-emerald-900">
            特別な注意点は少なめの日です。いつも通りの作業計画で問題なさそうです。
          </p>
        ) : (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-950">
              {advices.map((msg, i) => (
                <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
