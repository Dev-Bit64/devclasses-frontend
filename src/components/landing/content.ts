/**
 * Landing page copy and static content.
 *
 * Every claim here maps to functionality that exists in the product today
 * (chapter-wise MCQ practice, timed exams, scored results, detailed review,
 * PDF export, performance analysis, CBSE/GSEB 11th & 12th). No invented
 * statistics, testimonials, course counts or affiliations.
 */

export const CONTACT = {
  phone: "+91 98240 68390",
  phoneHref: "tel:+919824068390",
  email: "info@devclasses.in",
  emailHref: "mailto:info@devclasses.in",
  addressLines: [
    "Dev Classes, Opp Gyanjyot Travels,",
    "Nr Prabhu Oil Mill, Kamlabaug,",
    "Porbandar, Gujarat 360575",
  ],
} as const;

/** Mirrors the board/standard options accepted by the registration API. */
export const BOARDS = ["CBSE", "GSEB"] as const;
export const STANDARDS = ["11th", "12th"] as const;

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Practice", href: "#practice" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why us", href: "#why-us" },
  { label: "Contact", href: "#contact" },
] as const;

export const CAPABILITIES = [
  { icon: "ListChecks", label: "Chapter-wise MCQs" },
  { icon: "Timer", label: "Timed tests" },
  { icon: "Gauge", label: "Instant scoring" },
  { icon: "ClipboardList", label: "Detailed review" },
  { icon: "LineChart", label: "Performance analysis" },
  { icon: "FileDown", label: "PDF results" },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick your board & standard",
    description:
      "Register once with your board (CBSE or GSEB) and standard (11th or 12th). Everything you see afterwards follows your syllabus.",
  },
  {
    step: "02",
    title: "Choose a subject and chapter",
    description:
      "Select the Commerce subject you want to work on, then narrow it down to the exact chapter you are revising.",
  },
  {
    step: "03",
    title: "Attempt the test",
    description:
      "Work through the MCQs one question at a time, at your own pace, in a clean distraction-free test screen.",
  },
  {
    step: "04",
    title: "Review and improve",
    description:
      "Get your score the moment you submit, walk through every question with the correct answer, and export the result as a PDF.",
  },
] as const;

export const FEATURES = [
  {
    icon: "Layers",
    title: "Chapter-wise question banks",
    description:
      "Questions are organised by board, standard, subject and chapter — so you can practise exactly what you studied today instead of hunting through a textbook.",
  },
  {
    icon: "MonitorPlay",
    title: "Focused test experience",
    description:
      "One question at a time, four clear options, and simple navigation between questions. Nothing on screen competes for your attention.",
  },
  {
    icon: "CheckCircle2",
    title: "Instant scored results",
    description:
      "Submit and see your score immediately. No waiting, no manual checking, no ambiguity about where you stand.",
  },
  {
    icon: "Search",
    title: "Question-by-question review",
    description:
      "Go back through the paper to see what you answered, what the correct answer was, and which chapters need another pass.",
  },
  {
    icon: "TrendingUp",
    title: "Performance analysis",
    description:
      "Your dashboard tracks tests attempted, highest score and average score, so improvement over time is visible rather than guessed at.",
  },
  {
    icon: "FileDown",
    title: "Exportable results",
    description:
      "Download any result as a PDF to keep a record, share it with a parent, or bring it along to a doubt-clearing session.",
  },
] as const;

/** "Why Choose Dev Classes?" — original site copy, carried over verbatim. */
export const WHY_US = [

  {
    icon: "Briefcase",
    title: "Accounting is for Career",
    description:
      "Accounting is not just for exams. It is for building a Professional Career. Accounting + Taxation is a great combination for an extra-ordinary career.",
  },
  {
    icon: "GraduationCap",
    title: "We can help",
    description:
      "Having experience of 26 years in teaching Accounting, we can help you for better understanding the Fundamental Concepts of Accounting. We teach for building basic to higher level Accounting Skill following the Academic Curriculum.",
  },
  {
    icon: "MessagesSquare",
    title: "Teaching is our Passion",
    description:
      "We never loose an opportunity to clear our students's doubts. Online or Offline, we always try give our 100%.",
  },
  {
    icon: "FileCheck2",
    title: "Online MCQ Assessment",
    description:
      "Having difficulties in finding MCQs from the Textbooks? Our Website is here to help you for the MCQs. Get your self assessed by attempting MCQs of your desired Commerce Subjects here.",
  },
] as const;

export const FAQS = [
  {
    question: "What do I need to get started?",
    answer:
      "A free account. Register with your name, email, board and standard, and you can begin attempting tests right away.",
  },
  {
    question: "Which boards and standards are covered?",
    answer:
      "Dev Classes covers CBSE and GSEB for 11th and 12th standard Commerce subjects. You choose both when you register, and your practice follows that syllabus.",
  },
  {
    question: "How are the questions organised?",
    answer:
      "Every question sits under a board, standard, subject and chapter. That lets you practise a single chapter you have just studied instead of working through an entire subject.",
  },
  {
    question: "When do I find out my score?",
    answer:
      "Immediately after you submit. Your result is generated on the spot, with your score and a question-by-question breakdown you can review at your own pace.",
  },
  {
    question: "Can I keep a copy of my results?",
    answer:
      "Yes. Any result can be exported as a PDF from the results screen, so you can keep a record or share it.",
  },
  {
    question: "Can I retake a test?",
    answer:
      "Yes. You can attempt tests again as you revise, and your dashboard keeps track of tests attempted along with your highest and average scores.",
  },
  {
    question: "I forgot my password. What now?",
    answer:
      "Use the 'Forgot password' link on the login screen. We will email you a reset link that lets you set a new password.",
  },
] as const;
