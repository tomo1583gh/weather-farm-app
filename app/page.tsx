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

type AdviceLevel = "low" | "medium" | "high";
type AdviceKind = "temperature" | "rain" | "wind";

type Advice = {
  kind: AdviceKind;
  level: AdviceLevel;
  icon: string; // 例："☀️" "🌧" "💨"
  title: string; // 見出し
  message: string; // 詳細メッセージ
};

type DayTag = {
  icon: string; // 例:　"☀️" "🌧"
  label: string; // 例: "高温気味" "雨注意"
  className: string; // Tailwind のクラス
}

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
      temperature: 30,
      windspeed: 22,
      winddirection: 180,
      weathercode: 0,
      time: now.toISOString(),
    },
    daily: {
      time: days.map((d) => d.toISOString().slice(0, 10)),
      temperature_2m_max: [18, 19, 20, 18, 9, 19, 5],
      temperature_2m_min: [12, 11, 10, 9, 10, 11, 13],
      precipitation_sum: [0, 0, 0, 3.2, 0, 0.2, 15],
    },
  };
}
// --- --- 

// 風向き→方角名
function getWindDirectionName(deg: number): string {
  if (deg >= 337.5 || deg < 22.5) return "北風";
  if (deg >= 22.5 && deg < 67.5) return "北東の風";
  if (deg >= 67.5 && deg < 112.5) return "東風";
  if (deg >= 112.5 && deg < 157.5) return "南東の風";
  if (deg >= 157.5 && deg < 202.5) return "南風";
  if (deg >= 202.5 && deg < 247.5) return "南西の風";
  if (deg >= 247.5 && deg < 292.5) return "西風";
  return "北西の風";
}

// 今日の危険度スコア
type RiskLevel = "low" | "medium" | "high";

type RiskScoreResult = {
  score: number;   // 0~100
  level: RiskLevel // "low" | "medium" | "high"
  label: string;   // 表示用ラベル
};

// 今日の最高気温・降水量・風速からの危険度スコアを計算
function calcRiskScore(
  todayMax: number,
  todayPrecip: number,
  windSpeed: number
): RiskScoreResult {
  let score = 0;

  // 気温（暑さ・寒さ）
  if (todayMax >= 30) {
    score += 40;
  } else if (todayMax >= 25) {
    score += 25;
  } else if (todayMax <= 5) {
    score += 30;
  } else if (todayMax <= 10) {
    score += 20;
  }

  // 降水量
  if (todayPrecip >= 20) {
    score += 30;
  } else if (todayPrecip >= 5) {
    score += 15;
  }

  // 風速
  if (windSpeed >= 20) {
    score += 30;
  } else if (windSpeed >= 10) {
    score += 15;
  }

  // 0~100に丸める
  if (score > 100) score = 100;

  let level: RiskLevel;
  let label: string;

  if (score >= 70) {
    level = "high";
    label = "危険度高め";
  } else if (score >= 40) {
    level = "medium";
    label = "注意レベル";
  } else {
    level = "low";
    label = "比較的おだやか";
  }

  return { score, level, label };
}

// 風向き＋風速から1件のアドバイスを返す
function createWindAdvice(current: CurrentWeather): Advice | null {
  const speed = current.windspeed; // <km /h>
  const dirName = getWindDirectionName(current.winddirection);

  // 風が弱い日はスキップ
  if (speed < 8) return null;

  // 南風：蒸れ・倒伏
  if (dirName.includes("南")) {
    const isStrong = speed >= 20;
    return {
      kind: "wind",
      level: isStrong ? "high" : "medium",
      icon: isStrong ? "🌪" : "☀️",
      title: isStrong
        ? "南風＋強風による蒸れ・倒伏注意"
        : "南風による蒸れ注意",
      message: isStrong
        ? "南風かつ風がかなり強い予報です。ハウス内は高温多湿になりやすく、作物の蒸れや倒伏に注意が必要です。換気と支柱・ネットの固定を重点的に確認しましょう。"
        : "南風で温かく湿った空気が入りやすい予報です。病害発生に注意し、ハウス内の換気をこまめに行いましょう。",
    };
  }

  // 北風：冷え込み・乾燥
  if (dirName.includes("北")) {
    const isStrong = speed >= 20;
    return {
      kind: "wind",
      level: isStrong ? "high" : "medium",
      icon: isStrong ? "❄️" : "🧊",
      title: isStrong
        ? "北風＋強風による低温・乾燥注意"
        : "北風による冷え込み注意",
      message: isStrong
        ? "北風かつ風が強い予報です。体感温度が大きく下がり、乾燥もしやすくなります。防寒対策と霜・乾燥ストレスに注意してください。"
        : "北寄りの風で気温が下がりやすい見込みです。ハウスの保温や、夜間の冷え込み対策を意識しましょう。",
    };
  }

  // 西風：乾燥
  if (dirName.includes("西")) {
    const isStrong = speed >= 20;
    return {
      kind: "wind",
      level: isStrong ? "medium" : "low",
      icon: "🌫",
      title: isStrong
        ? "西風による強い乾燥注意"
        : "西風による乾燥傾向",
      message: isStrong
        ? "西風かつ風が強い予報です。葉や土が乾きやすくなります。潅水タイミングの前倒しや、マルチ・被覆の状態を確認しましょう。"
        : "西寄りの風でやや乾燥しやすい傾向があります。苗の乾燥や萎れに注意してください。",
    };
  }

  // 東寄りの風：影響は小さいための軽いコメント
  if (dirName.includes("東")) {
    return {
      kind: "wind",
      level: "low",
      icon: "🌬",
      title: "東寄りの風の影響",
      message:
        "東寄りの風が予想されます。大きなリスクは少ないですが、ハウスの開口部や風の抜け方を確認しておきましょう。",
    };
  }

  return null;
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

  // 今日の危険度スコア計算
  const risk = calcRiskScore(todayMax, todayPrecip, current.windspeed);

  const riskColorClass =
    risk.level === "high"
      ? "bg-red text-red-700"
      : risk.level === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  // --- 農作業アドバイスの簡単なロジック ---
  const advices: Advice[] = [];

  // 気温に関するアドバイス
  if (todayMax >= 28) {
    advices.push({
      kind: "temperature",
      level: "high",
      icon: "☀️",
      title: "高温注意",
      message:
        "最高気温がかなり高めです。潅水を多めにして、作業は朝夕の涼しい時間に集中させましょう。",
    });
  } else if (todayMax >= 24) {
    advices.push({
      kind: "temperature",
      level: "medium",
      icon: "☀️",
      title: "やや高めな気温",
      message:
        "日中は少し熱くなりそうです。ハウス内の換気と、作業者の熱中症対策を意識しましょう。",
    });
  } else if (todayMax <= 10) {
    advices.push({
      kind: "temperature",
      level: "high",
      icon: "❄️",
      title: "低温注意",
      message:
        "気温が低めです。防寒対策と、夜間の低温ストレスに注意してください。",
    });
  }

  // 降水量に関するアドバイス
  if (todayPrecip >= 10) {
    advices.push({
      kind: "rain",
      level: "high",
      icon: "🌧",
      title: "大雨リスク",
      message:
        "降水量が多い予報です。排水路の確認や、収穫・出荷のスケジュール調整を検討しましょう。"
  });
  } else if (todayPrecip >= 1) {
    advices.push({
      kind: "rain",
      level: "medium",
      icon: "🌦",
      title: "にわか雨の可能性",
      message:
        "にわか雨の可能性があります。屋外資材や機械が濡れないように注意しておきましょう。"
  });
  }

  // 風に関するアドバイス
  if (current.windspeed >= 20) {
    advices.push({
      kind: "wind",
      level: "high",
      icon: "💨",
      title: "強風注意",
      message:
        "風がかなり強く吹く予報です。ハウスやトンネル、支柱・防虫ネットの固定を重点的に確認し飛ばされそうな資材は事前に片づけておきましょう。",
  });
  } else if (current.windspeed >= 8) {
    advices.push({
      kind: "wind",
      level: "medium",
      icon: "💨",
      title: "やや強い風",
      message:
        "やや風が強い一日になりそうです。マルチやビニール、ネット・支柱の固定を再確認しておきましょう。"
    });
  }

  const windDirName = getWindDirectionName(current.winddirection);


  // 風向き＋風速アドバイス
  const windAdvice = createWindAdvice(current);
  if (windAdvice) {
    advices.push(windAdvice);
  }

  // --- アドバイスロジックここまで　---


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

            {/* 数値部分：最高/最低を色分けして横並びに */}
            <div className="mt-1 flex items-baseline gap-1 text-lg  md:text-xl">
              <span className="flex items-baseline gap-1 tabular-nums">
                <span className="md-text-sm text-slate-500">最高</span>
                <span className="font-semibold text-rose-600">
                {todayMax.toFixed(1)}℃
                </span>
              </span>

              <span className="flex items-baseline gap-1 tabular-nums">
                <span className="md:text-sm text-slate-500">最低</span>
                <span className="font-semibold text-sky-600">
                  {todayMin.toFixed(1)}℃
                </span>
              </span>
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
              風向 {windDirName} ({current.winddirection.toFixed(0)}°)
            </div>
          </div>
        </div>
      </section>

      {/* 今日の危険度カード */}
      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 md:text-lg">
              今日の気象リスク評価
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              気温・降水量・風の強さから、簡易的な危険度スコアを表示しています（学習用）。
            </p>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${riskColorClass}`}
          >
            {risk.label}
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <div className="text-3xl font-bold md:text-4xl">
            {risk.score}
            <span className="text-lg font-semibold"> / 100</span>
          </div>
          <p className="text-xs text-slate-500 md:text-sm">
            ※ あくまでも目安です。実際の作業計画では、作物の状態や圃場の条件も合わせて判断してください。
          </p>
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

            // --- 週間予報用のタグ判定 ---
            const tags: DayTag[] = [];

            // 気温系
            if (max >= 28) {
              tags.push({
                icon: "☀️",
                label: "高温気味",
                className: "bg-orange-100 text-orange-700",
              });
            } else if (max <= 10) {
              tags.push({
                icon: "❄️",
                label: "低温注意",
                className: "bg-sky-100 text-sky-700",
              });
            }

            // 降水系
            if (prec >= 10) {
              tags.push({
                icon: "🌧",
                label: "雨量多め",
                className: "bg-blue-100 text-blue-700",
              });
            } else if (prec >= 1) {
              tags.push({
                icon: "🌦",
                label: "にわか雨",
                className: "bg-indigo-50 text-indigo-700",
              });
            }

            return (
              <div
                key={dStr}
                className="flex flex-col gap-2 rounded-lg bg-slate-50 px-3 py-2 md:flex-row md:items-center md:justify-between md:px-4 md:py-3"
              >
                {/* 1行目：日付＋今日のバッジ＋数値（横並び・位置固定 */}
                <div className="flex items-center justify-between gap-3">

                {/* 左側：日付ブロック（幅固定） */}
                <div className="flex items-center gap-2 md:w-40">
                  <span className="text-sm font-medium text-slate-700 md:text-base">
                    {label}
                  </span>
                  {index === 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      今日
                    </span>
                  )}
                </div>

                {/* 右側：最高 / 最低 / 降水量　（幅固定＋色分け*/}
                  <div className="flex items-baseline gap-4 text-xs md:text-sm">
                    <span className="flex w-28 items-baseline justify-end gap-1 tabular-nums">
                      <span className="text-[11px] text-slate-500">最高</span>
                      <span className="font-semibold text-rose-600">
                        {max.toFixed(1)}℃
                      </span>
                    </span>

                    <span className="flex w-28 items-baseline justify-end gap-1 tabular-nums">
                      <span className="text-[11px] text-slate-500">最低</span>
                      <span className="font-semibold text-sky-600">
                        {min.toFixed(1)}℃
                      </span>
                    </span>

                    <span className="flex w-28 items-baseline justify-end gap-1 tabular-nums">
                      <span className="text-[11px] text-slate-500">降水</span>
                      <span className="font-semibold text-sky-700">
                        {prec.toFixed(1)}mm
                      </span>
                    </span>
                  </div>
                </div>

                {/* 2行目：タグ（あれば表示・なければ何も表示しない） */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tag.className}`}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.label}</span>
                      </span>
                    ))}
                  </div>
                )}
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
          <ul className="mt-3 space-y-3">
              {advices.map((a, i) => {
                const levelClass =
                  a.level === "high"
                    ? "bg-red-100 text-red-700"
                    : a.level === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                
                const levelLabel =
                  a.level === "high"
                    ? "レベル：高"
                    : a.level === "medium"
                      ? "レベル：中"
                      : "レベル：低";
                
                return (
                  <li
                    key={i}
                    className="flex gap-3 rounded-lg bg-emerald-50/80 px-3 py-2 md:px-4 md:py-3"
                  >
                    {/* アイコン丸 */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg">
                      {a.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-emerald-900 md:text-base">
                          {a.title}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${levelClass}`}
                        >
                          {levelLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-emerald-950">
                        {a.message}
                      </p>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
}
