/**
 * Elite Pro Fitness - Timetable Data & Queries
 */

export const FILTERS = [
  { key: "all", label: "All" },
  { key: "boxing", label: "Boxing" },
  { key: "squad", label: "Squad" },
  { key: "ladies", label: "Ladies only" },
  { key: "juniors", label: "Kids & Juniors" },
  { key: "martial", label: "Martial arts" },
  { key: "fitness", label: "Fitness" },
];

export const DISCIPLINE_COLORS = {
  boxing: "#3DDC84",
  dbg: "#E52E2E",
  jujitsu: "#3BA7F0",
  weights: "#A0703C",
  squad: "#F28C28",
  ladies: "#E85AA7",
  run: "#F5D33C",
  kickboxing: "#3E52D9",
};

export const SESSIONS = [
  // Monday
  {
    id: "mon-junior-beginners",
    day: "mon",
    start: "17:30",
    end: "18:30",
    title: "Junior Beginners",
    discipline: "boxing",
    audience: ["kids", "juniors"],
    filters: ["boxing", "juniors"],
  },
  {
    id: "mon-junior-elite-squad-boxing",
    day: "mon",
    start: "18:30",
    end: "19:30",
    title: "Junior Elite Squad Boxing",
    discipline: "squad",
    audience: ["juniors"],
    filters: ["squad", "boxing", "juniors"],
  },
  {
    id: "mon-senior-elite-boxing",
    day: "mon",
    start: "19:30",
    end: "21:00",
    title: "Senior Elite Boxing",
    discipline: "boxing",
    audience: ["adults"],
    filters: ["boxing"],
  },

  // Tuesday
  {
    id: "tue-ladies-only-boxing",
    day: "tue",
    start: "18:00",
    end: "19:00",
    title: "Ladies Only Boxing",
    discipline: "ladies",
    audience: ["ladies"],
    filters: ["ladies"],
  },
  {
    id: "tue-squad-training",
    day: "tue",
    start: "19:00",
    end: "20:30",
    title: "Squad Training",
    discipline: "squad",
    audience: ["adults"],
    filters: ["squad", "boxing"],
  },

  // Wednesday
  {
    id: "wed-ladies-legs-bums-tums",
    day: "wed",
    start: "12:00",
    end: "13:00",
    title: "Ladies Legs, Bums & Tums",
    discipline: "ladies",
    audience: ["ladies"],
    filters: ["ladies"],
  },
  {
    id: "wed-weight-training-session",
    day: "wed",
    start: "14:00",
    end: "15:00",
    title: "Weight Training Session",
    discipline: "weights",
    audience: ["adults"],
    filters: ["fitness"],
  },
  {
    id: "wed-junior-beginners",
    day: "wed",
    start: "17:30",
    end: "18:30",
    title: "Junior Beginners",
    discipline: "boxing",
    audience: ["kids", "juniors"],
    filters: ["boxing", "juniors"],
  },
  {
    id: "wed-junior-elite-squad-boxing",
    day: "wed",
    start: "18:30",
    end: "19:30",
    title: "Junior Elite Squad Boxing",
    discipline: "squad",
    audience: ["juniors"],
    filters: ["squad", "boxing", "juniors"],
  },
  {
    id: "wed-senior-elite-boxing",
    day: "wed",
    start: "19:30",
    end: "21:00",
    title: "Senior Elite Boxing",
    discipline: "boxing",
    audience: ["adults"],
    filters: ["boxing"],
  },

  // Thursday
  {
    id: "thu-ladies-only-boxing",
    day: "thu",
    start: "18:00",
    end: null,
    title: "Ladies Only Boxing",
    discipline: "ladies",
    audience: ["ladies"],
    filters: ["ladies"],
  },
  {
    id: "thu-squad-training",
    day: "thu",
    start: "19:00",
    end: "20:00",
    title: "Squad Training",
    discipline: "squad",
    audience: ["adults"],
    filters: ["squad", "boxing"],
  },
  {
    id: "thu-mma-ju-jitsu",
    day: "thu",
    start: "20:00",
    end: "21:00",
    title: "MMA + Ju Jitsu",
    discipline: "jujitsu",
    audience: ["adults"],
    filters: ["martial"],
  },

  // Friday
  {
    id: "fri-junior-elite-squad-boxing",
    day: "fri",
    start: "17:00",
    end: "18:00",
    title: "Junior Elite Squad Boxing",
    discipline: "squad",
    audience: ["juniors"],
    filters: ["squad", "boxing", "juniors"],
  },
  {
    id: "fri-senior-elite-boxing",
    day: "fri",
    start: "18:00",
    end: "19:30",
    title: "Senior Elite Boxing",
    discipline: "boxing",
    audience: ["adults"],
    filters: ["boxing"],
  },

  // Saturday
  {
    id: "sat-run-club",
    day: "sat",
    start: "09:00",
    end: "10:00",
    title: "Run Club",
    discipline: "run",
    audience: ["adults"],
    filters: ["fitness"],
  },
  {
    id: "sat-advanced-junior-classes",
    day: "sat",
    start: "09:30",
    end: "10:30",
    title: "Advanced Junior Classes",
    discipline: "boxing",
    audience: ["juniors"],
    filters: ["boxing", "juniors"],
  },
  {
    id: "sat-boxing-session",
    day: "sat",
    start: "10:30",
    end: "12:00",
    title: "Boxing Session",
    discipline: "boxing",
    audience: ["adults"],
    filters: ["boxing"],
  },
  {
    id: "sat-junior-development-boxing-group",
    day: "sat",
    start: "13:00",
    end: "15:00",
    title: "Junior Development Boxing Group",
    discipline: "dbg",
    audience: ["juniors"],
    filters: ["juniors", "boxing"],
  },
  {
    id: "sat-kick-boxing",
    day: "sat",
    start: null,
    end: null,
    title: "Kick Boxing",
    discipline: "kickboxing",
    audience: ["adults"],
    filters: ["martial"],
  },
  {
    id: "sat-squad-training",
    day: "sat",
    start: "14:00",
    end: "15:00",
    title: "Squad Training",
    discipline: "squad",
    audience: ["adults"],
    filters: ["squad", "boxing"],
  },

  // Sunday
  {
    id: "sun-run-club",
    day: "sun",
    start: "09:00",
    end: "10:00",
    title: "Run Club",
    discipline: "run",
    audience: ["adults"],
    filters: ["fitness"],
  },
  {
    id: "sun-squad-training",
    day: "sun",
    start: "12:00",
    end: "13:00",
    title: "Squad Training",
    discipline: "squad",
    audience: ["adults"],
    filters: ["squad", "boxing"],
  },
  {
    id: "sun-ju-jitsu",
    day: "sun",
    start: "13:00",
    end: "14:00",
    title: "Ju Jitsu",
    discipline: "jujitsu",
    audience: ["adults"],
    filters: ["martial"],
  },
];

export function filterSessions(list, key) {
  if (!key || key === "all") return [...list];
  return list.filter((s) => s.filters.includes(key));
}

export function groupByDay(list) {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const res = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };

  list.forEach((s) => {
    if (res[s.day]) res[s.day].push(s);
  });

  days.forEach((d) => {
    res[d].sort((a, b) => {
      if (!a.start) return 1;
      if (!b.start) return -1;
      return a.start.localeCompare(b.start);
    });
  });

  return res;
}

export function nextSession(list, now = new Date()) {
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const currentDayIdx = now.getDay();
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${currentHours}:${currentMinutes}`;

  const grouped = groupByDay(list);

  // Search over next 7 days
  for (let offset = 0; offset < 7; offset++) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const dayKey = dayNames[dayDate.getDay()];
    const sessions = grouped[dayKey] || [];

    for (const session of sessions) {
      if (!session.start) continue;
      if (offset === 0) {
        if (session.start > currentTime) {
          return session;
        }
      } else {
        return session;
      }
    }
  }

  return null;
}

export function sessionsForClass(classKey) {
  if (!classKey) return [];
  return SESSIONS.filter((s) => s.audience.includes(classKey));
}
