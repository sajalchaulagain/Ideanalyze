/*
  ============================================================================
  MOCK DATA — stands in for the MongoDB database until the backend exists.
  ============================================================================
  Every object below follows the exact shape the future MongoDB "Idea"
  model will use, so swapping to real API data later means changing
  where the data comes FROM, not how the UI reads it:

    {
      _id: "123",               // MongoDB-style id
      title: "...",
      description: "...",
      category: "...",
      targetAudience: "...",
      aiAnalysis: {
        problem, solution, targetUsers,
        features[], techStack[], challenges, futureImprovements
      },
      createdAt: "2026-09-16"   // ISO date string
    }
*/

// One reusable example analysis shown on the landing page.
export const mockAnalysis = {
  problem:
    "Kathmandu's waste collection runs on fixed routes and word-of-mouth complaints, so trucks waste fuel on half-empty stops while some neighborhoods overflow for days.",
  solution:
    "A dashboard that predicts fill levels from past pickup data and citizen reports, then generates optimized daily routes for each collection truck.",
  targetUsers:
    "Municipal waste departments, private collection companies, and engaged citizens who report overflowing bins.",
  features: [
    "Fill-level prediction per collection point",
    "Automatic daily route optimization for trucks",
    "Citizen reporting via a lightweight mobile form",
    "Ward-level analytics dashboard for officials",
  ],
  techStack: ["React", "Node.js", "Express", "MongoDB", "Python (forecasting)"],
  challenges:
    "Prediction quality depends on consistent historical data, which municipalities may not have yet. Driver adoption needs the app to work offline in low-connectivity areas.",
  futureImprovements:
    "Add IoT bin sensors for real-time fill data, introduce recycling incentives for households, and publish an open dataset for researchers.",
};

export const mockIdeas = [
  {
    _id: "idea-001",
    title: "Smart Waste Management",
    description:
      "An AI system that helps Kathmandu manage waste collection with route optimization and fill-level prediction.",
    category: "AI / Sustainability",
    targetAudience: "Municipalities",
    aiAnalysis: { ...mockAnalysis },
    createdAt: "2026-09-10",
  },
  {
    _id: "idea-002",
    title: "Nepali Sign Language Tutor",
    description:
      "A mobile app that teaches Nepali Sign Language through interactive video lessons and camera-based practice feedback.",
    category: "EdTech",
    targetAudience: "Students & Teachers",
    aiAnalysis: {
      problem:
        "Few accessible resources exist for learning Nepali Sign Language, leaving hearing-impaired students isolated in mainstream classrooms.",
      solution:
        "A Duolingo-style app with bite-sized NSL video lessons, quizzes, and on-device gesture recognition that scores the learner's hand shapes.",
      targetUsers:
        "Deaf and hard-of-hearing students, their families, teachers, and interpreters in training.",
      features: [
        "Structured NSL curriculum from alphabet to conversation",
        "Camera-based gesture practice with instant feedback",
        "Offline lesson packs for low-connectivity schools",
        "Teacher dashboard to track classroom progress",
      ],
      techStack: ["React Native", "Node.js", "Express", "MongoDB", "TensorFlow Lite"],
      challenges:
        "Gesture recognition needs a quality NSL dataset that may need to be collected from scratch with the deaf community's help.",
      futureImprovements:
        "Add live video-call practice rooms, expand to other regional sign languages, and partner with schools for certification.",
    },
    createdAt: "2026-09-06",
  },
  {
    _id: "idea-003",
    title: "FarmLink — Direct Farm Marketplace",
    description:
      "A platform connecting Terai farmers directly with Kathmandu buyers to cut out middlemen and reduce food waste.",
    category: "AgriTech",
    targetAudience: "Farmers & Buyers",
    aiAnalysis: {
      problem:
        "Small farmers sell to middlemen at low prices while city buyers overpay, and perishable produce rots in transit due to poor coordination.",
      solution:
        "A bilingual marketplace where farmers list harvests with pickup dates and buyers place pooled orders, with SMS fallback for farmers without smartphones.",
      targetUsers:
        "Smallholder farmers, cooperatives, restaurants, and household buyers in urban areas.",
      features: [
        "Bilingual (Nepali/English) harvest listings",
        "Pooled ordering to make rural delivery viable",
        "SMS + voice updates for non-smartphone farmers",
        "Transparent pricing with cooperative-level analytics",
      ],
      techStack: ["React", "Node.js", "Express", "MongoDB", "eSewa/Khalti payments"],
      challenges:
        "Last-mile cold-chain logistics are the hardest part; trust must be built on both sides with ratings and guaranteed payments.",
      futureImprovements:
        "Add crop-price forecasting, integrate weather alerts, and offer micro-loans through partner cooperatives.",
    },
    createdAt: "2026-08-28",
  },
  {
    _id: "idea-004",
    title: "Hackathon Team Finder",
    description:
      "A matchmaking app that helps students find balanced hackathon teams based on skills, availability, and interests.",
    category: "Community",
    targetAudience: "Students & Organizers",
    aiAnalysis: {
      problem:
        "Students with great ideas skip hackathons because they can't find teammates with complementary skills in time.",
      solution:
        "Profiles with skills, past projects, and availability feed a matching engine that suggests balanced teams before and during events.",
      targetUsers:
        "Student hackers, hackathon organizers, and campus coding clubs.",
      features: [
        "Skill + availability based team matching",
        "Event pages with one-click team formation",
        "Built-in idea pitch board for recruiting",
        "Post-event showcase and feedback",
      ],
      techStack: ["React", "Node.js", "Express", "MongoDB", "Socket.io"],
      challenges:
        "Matching quality depends on honest skill self-reporting; critical mass per event is needed for the matching to feel useful.",
      futureImprovements:
        "Verify skills via GitHub/portfolio imports, add mentor matching, and support online-first hybrid events.",
    },
    createdAt: "2026-08-15",
  },
];

/*
  Builds a plausible mock analysis for ANY idea the user types.
  Why a function instead of one static object? Because the Create Idea page
  should feel alive — the "analysis" mentions the user's own title and
  description. The real AI will replace this entirely; nothing here is
  sent anywhere, it just runs locally in the browser.
*/
export function buildMockAnalysis({ title, description, category, targetAudience }) {
  const safeTitle = title?.trim() || "Your idea";
  const safeDescription = description?.trim() || "the concept described above";
  const safeCategory = category?.trim() || "General";
  const safeAudience = targetAudience?.trim() || "early adopters in the target market";

  return {
    problem: `People who need "${safeTitle}" currently rely on slow, manual workarounds. The core pain behind "${safeDescription.slice(0, 120)}${safeDescription.length > 120 ? "…" : ""}" is wasted time and inconsistent quality.`,
    solution: `"${safeTitle}" solves this with a focused ${safeCategory} product: a simple interface on top of a reliable backend that automates the repetitive parts and guides the user to a result in minutes instead of days.`,
    targetUsers: `Primary users are ${safeAudience}. Secondary users include teams and organizations who serve that group and need reporting, oversight, and integrations.`,
    features: [
      "Guided onboarding tailored to first-time users",
      "Core workflow that completes the main job end-to-end",
      "Dashboard with history, search, and exports",
      "Notifications and reminders to keep users engaged",
      "Admin view for managing users and content",
    ],
    techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    challenges:
      "The MVP must be narrow enough to ship fast but complete enough to be useful. Data quality, user trust, and onboarding drop-off are the three risks to watch first.",
    futureImprovements:
      "Once the core loop works: add analytics, a public API, mobile apps, and usage-based pricing. Collect feedback for 4–6 weeks before expanding scope.",
  };
}

// Category options used by the Create Idea form and the Dashboard filter.
// Later these could come from the backend, but a static list is fine.
export const ideaCategories = [
  "AI / Machine Learning",
  "EdTech",
  "AgriTech",
  "FinTech",
  "HealthTech",
  "Sustainability",
  "Community",
  "Developer Tools",
  "E-commerce",
  "Other",
];
