
// ─── Data Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  initials: string;
  ssb_board: string;
  streak: number;
  total_pts: number;
  role: "aspirant" | "admin";
  city: string;
  aspirantType: string;
  isCurrentUser?: boolean;
}

export interface Club {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Task {
  id: string;
  club_id: string;
  title: string;
  description: string;
  pts: number;
  date: string; // ISO date string
  active: boolean;
  requires_proof?: boolean;
}

export interface Completion {
  user_id: string;
  task_id: string;
  completed_at: string;
}

export interface ClubPoints {
  club_id: string;
  points: number;
}

// ─── Static Clubs ────────────────────────────────────────────────────────────

export const CLUBS: Club[] = [
  {
    id: "strava",
    name: "Strava Club",
    icon: "🏃",
    description: "Physical fitness and outdoor activities",
    color: "#EF9F27",
  },
  {
    id: "newspaper",
    name: "Newspaper Club",
    icon: "📰",
    description: "Current affairs and editorial skills",
    color: "#BA7517",
  },
  {
    id: "heroes",
    name: "Heroes of Army",
    icon: "🎖️",
    description: "Military history and valor stories",
    color: "#EF9F27",
  },
  {
    id: "psych",
    name: "Psych Club",
    icon: "🧠",
    description: "Psychology and mental resilience",
    color: "#BA7517",
  },
  {
    id: "comm",
    name: "Communication Club",
    icon: "💬",
    description: "Public speaking and leadership",
    color: "#EF9F27",
  },
];

// ─── Static Users ─────────────────────────────────────────────────────────────

export const USERS: User[] = [
  {
    id: "u1",
    name: "Arjun Sharma",
    initials: "AS",
    ssb_board: "Allahabad",
    streak: 14,
    total_pts: 1240,
    role: "aspirant",
    city: "Lucknow",
    aspirantType: "CDS",
    isCurrentUser: true,
  },
  {
    id: "u2",
    name: "Priya Nair",
    initials: "PN",
    ssb_board: "Bangalore",
    streak: 21,
    total_pts: 1580,
    role: "aspirant",
    city: "Pune",
    aspirantType: "NDA",
  },
  {
    id: "u3",
    name: "Rahul Verma",
    initials: "RV",
    ssb_board: "Bhopal",
    streak: 7,
    total_pts: 980,
    role: "aspirant",
    city: "Delhi",
    aspirantType: "TGC",
  },
  {
    id: "u4",
    name: "Sneha Kapoor",
    initials: "SK",
    ssb_board: "Allahabad",
    streak: 18,
    total_pts: 1420,
    role: "aspirant",
    city: "Mumbai",
    aspirantType: "SSC Tech",
  },
  {
    id: "u5",
    name: "Dev Malhotra",
    initials: "DM",
    ssb_board: "Chennai",
    streak: 3,
    total_pts: 720,
    role: "aspirant",
    city: "Jaipur",
    aspirantType: "NDA",
  },
  {
    id: "u6",
    name: "Ananya Roy",
    initials: "AR",
    ssb_board: "Kolkata",
    streak: 9,
    total_pts: 1100,
    role: "aspirant",
    city: "Nagpur",
    aspirantType: "CDS",
  },
  {
    id: "u7",
    name: "Vikram Singh",
    initials: "VS",
    ssb_board: "Jalandhar",
    streak: 25,
    total_pts: 1750,
    role: "aspirant",
    city: "Chandigarh",
    aspirantType: "NCC Special Entry",
  },
];

// ─── Today's Date ─────────────────────────────────────────────────────────────

export const TODAY = new Date().toISOString().slice(0, 10);

// ─── Tasks per club ────────────────────────────────────────────────────────────

export const TASKS: Task[] = [
  // Strava Club
  {
    id: "t1",
    club_id: "strava",
    title: "Complete a 5 km morning run",
    description: "Log your run on Strava and share the activity link.",
    pts: 20,
    date: TODAY,
    active: true,
  },
  {
    id: "t2",
    club_id: "strava",
    title: "100 push-ups challenge",
    description: "Complete 100 push-ups in sets and post a video.",
    pts: 15,
    date: TODAY,
    active: true,
  },
  {
    id: "t3",
    club_id: "strava",
    title: "Swim 1 km in pool",
    description: "Log your swimming session with lap count.",
    pts: 25,
    date: TODAY,
    active: true,
  },
  // Newspaper Club
  {
    id: "t4",
    club_id: "newspaper",
    title: "Write a 200-word editorial",
    description: "Write an editorial on a current affairs topic and share in the group.",
    pts: 30,
    date: TODAY,
    active: true,
  },
  {
    id: "t5",
    club_id: "newspaper",
    title: "Read & summarize front page",
    description: "Summarize today's Hindu/Times front page in 5 bullet points.",
    pts: 10,
    date: TODAY,
    active: true,
  },
  {
    id: "t6",
    club_id: "newspaper",
    title: "GD topic preparation",
    description: "Prepare 3 arguments for and against today's GD topic.",
    pts: 20,
    date: TODAY,
    active: true,
  },
  // Heroes of Army
  {
    id: "t7",
    club_id: "heroes",
    title: "Study a war biography chapter",
    description: "Read one chapter from an assigned army hero biography.",
    pts: 25,
    date: TODAY,
    active: true,
  },
  {
    id: "t8",
    club_id: "heroes",
    title: "Answer military trivia quiz",
    description: "Complete the 10-question quiz posted by moderator.",
    pts: 15,
    date: TODAY,
    active: true,
  },
  // Psych Club
  {
    id: "t9",
    club_id: "psych",
    title: "10-minute mindfulness session",
    description: "Complete a guided mindfulness exercise and log it.",
    pts: 10,
    date: TODAY,
    active: true,
  },
  {
    id: "t10",
    club_id: "psych",
    title: "Psychology concept flashcard",
    description: "Create and share one flashcard on a psychology concept.",
    pts: 20,
    date: TODAY,
    active: true,
  },
  {
    id: "t11",
    club_id: "psych",
    title: "PPDT story submission",
    description: "Write a PPDT story and get it reviewed by a senior.",
    pts: 30,
    date: TODAY,
    active: true,
  },
  // Communication Club
  {
    id: "t12",
    club_id: "comm",
    title: "2-minute impromptu speech",
    description: "Deliver a 2-minute impromptu speech on a random topic.",
    pts: 25,
    date: TODAY,
    active: true,
  },
  {
    id: "t13",
    club_id: "comm",
    title: "Vocabulary word of the day",
    description: "Use today's vocab word correctly in 3 sentences.",
    pts: 10,
    date: TODAY,
    active: true,
  },
];

// ─── Initial Completions (some tasks pre-done for realism) ───────────────────

export const INITIAL_COMPLETIONS: Completion[] = [
  { user_id: "u1", task_id: "t1", completed_at: TODAY },
  { user_id: "u1", task_id: "t4", completed_at: TODAY },
  { user_id: "u1", task_id: "t9", completed_at: TODAY },
];

// ─── Club Points Per User (mock historical data) ──────────────────────────────

export const USER_CLUB_POINTS: Record<string, Record<string, number>> = {
  u1: { strava: 220, newspaper: 180, heroes: 340, psych: 260, comm: 200 },
  u2: { strava: 380, newspaper: 320, heroes: 280, psych: 310, comm: 290 },
  u3: { strava: 150, newspaper: 210, heroes: 280, psych: 180, comm: 160 },
  u4: { strava: 310, newspaper: 280, heroes: 340, psych: 250, comm: 240 },
  u5: { strava: 120, newspaper: 160, heroes: 200, psych: 130, comm: 110 },
  u6: { strava: 240, newspaper: 200, heroes: 260, psych: 220, comm: 180 },
  u7: { strava: 400, newspaper: 360, heroes: 380, psych: 320, comm: 290 },
};

// ─── Weekly Points (mock) ─────────────────────────────────────────────────────

export const USER_WEEKLY_POINTS: Record<string, number> = {
  u1: 120,
  u2: 180,
  u3: 80,
  u4: 150,
  u5: 60,
  u6: 110,
  u7: 200,
};

export const USER_TODAY_POINTS: Record<string, number> = {
  u1: 30,
  u2: 55,
  u3: 20,
  u4: 45,
  u5: 10,
  u6: 35,
  u7: 65,
};
