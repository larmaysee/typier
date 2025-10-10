/**
 * English sentences for typing practice, categorized by difficulty
 */

export const ENGLISH_SENTENCES = {
  // Easy sentences (short, simple structure)
  easy: [
    "The cat is on the mat.",
    "I can see a big red car.",
    "She has a new blue book.",
    "We go to the park today.",
    "He runs very fast.",
    "The sun is hot and bright.",
    "My dog likes to play.",
    "She reads a good story.",
    "We eat lunch at home.",
    "The tree is very tall.",
    "I like to swim in summer.",
    "He has a pet bird.",
    "The rain falls on the roof.",
    "We walk to school together.",
    "She draws a nice picture.",
    "The baby sleeps in the crib.",
    "I help my mom cook dinner.",
    "The flowers smell very sweet.",
    "We watch a funny movie.",
    "He rides his bike to work.",
  ],

  // Medium sentences (moderate length, varied vocabulary)
  medium: [
    "The quick brown fox jumps over the lazy dog.",
    "Learning to type correctly requires practice and patience.",
    "Technology has changed the way we communicate with each other.",
    "Education is important for personal and professional development.",
    "The weather forecast predicts rain for the weekend.",
    "Many people enjoy reading books during their free time.",
    "Regular exercise contributes to better health and wellness.",
    "Cooking at home can be both enjoyable and cost-effective.",
    "Travel broadens our understanding of different cultures.",
    "Music has the power to influence our emotions and mood.",
    "Environmental protection is a global responsibility.",
    "Time management skills are essential for productivity.",
    "Creative thinking helps solve complex problems effectively.",
    "Teamwork and collaboration lead to better outcomes.",
    "Quality sleep is crucial for mental and physical health.",
    "Effective communication builds stronger relationships.",
    "Innovation drives progress in science and technology.",
    "Financial planning helps secure a stable future.",
    "Cultural diversity enriches our communities and workplaces.",
    "Continuous learning is key to personal growth and success.",
  ],

  // Hard sentences (complex structure, punctuation, numbers)
  hard: [
    "The sophisticated algorithm processes approximately 1,000,000 data points per second.",
    "According to the research conducted in 2023, climate change affects 78% of ecosystems worldwide.",
    "JavaScript developers often use frameworks like React, Vue.js, and Angular for building user interfaces.",
    "The company's quarterly revenue increased by 15.7% compared to the same period last year.",
    "Scientists discovered that the newly identified species (Homo technologicus) exhibits unique characteristics.",
    "The implementation of artificial intelligence in healthcare has shown promising results: 94% accuracy in diagnostics.",
    'Professor Johnson\'s groundbreaking research on quantum computing was published in "Nature" magazine.',
    "The international conference, scheduled for December 15-17, will feature 250+ speakers from 45 countries.",
    "Advanced cybersecurity measures protect sensitive data through encryption algorithms and multi-factor authentication.",
    "The interdisciplinary approach combines psychology, neuroscience, and computer science methodologies.",
    "Market analysis indicates that e-commerce sales will reach $6.2 trillion by 2025 (up from $4.9 trillion in 2021).",
    "The pharmaceutical company's new drug demonstrated 87.3% effectiveness in Phase III clinical trials.",
    "Blockchain technology enables decentralized finance (DeFi) applications with smart contract functionality.",
    "The architectural design incorporates sustainable materials and energy-efficient systems throughout the building.",
    'Researchers published their findings in peer-reviewed journals: "Cell", "Science", and "Nature Biotechnology".',
    "The machine learning model achieved 99.2% accuracy using convolutional neural networks and transfer learning.",
    "Economic indicators suggest a 3.1% GDP growth rate, despite inflationary pressures and supply chain disruptions.",
    "The collaborative project involves universities from North America, Europe, and Asia-Pacific regions.",
    "Advanced manufacturing techniques utilize robotics, IoT sensors, and predictive maintenance algorithms.",
    "The comprehensive study analyzed data from 50,000+ participants across 12 countries over 5 years.",
  ],

  // Programming-focused sentences
  programming: [
    'const greeting = "Hello, World!"; console.log(greeting);',
    "function calculateSum(a, b) { return a + b; }",
    'if (user.isAuthenticated) { redirectTo("/dashboard"); }',
    "The async/await syntax makes handling promises more readable.",
    "React components use props to pass data between parent and child elements.",
    "Array methods like map(), filter(), and reduce() are essential for data manipulation.",
    "TypeScript provides static type checking for JavaScript applications.",
    "Git version control helps track changes and collaborate with other developers.",
    "RESTful APIs use HTTP methods: GET, POST, PUT, DELETE for CRUD operations.",
    "CSS Grid and Flexbox provide powerful layout options for responsive design.",
    "Node.js enables server-side JavaScript development with npm package management.",
    "Database queries use SQL syntax: SELECT, INSERT, UPDATE, DELETE statements.",
    "The Model-View-Controller (MVC) pattern separates application concerns effectively.",
    "Unit testing ensures code reliability using frameworks like Jest or Mocha.",
    "webpack bundles JavaScript modules and optimizes assets for production deployment.",
  ],
};

// Common English punctuation patterns for practice
export const PUNCTUATION_PATTERNS = [
  "Hello, how are you today?",
  "I can't believe it's already 3:30 PM!",
  "The book costs $29.99 (including tax).",
  'She said, "I\'ll be there at 5:00."',
  "Items needed: milk, eggs, bread, and cheese.",
  "Visit our website at www.example.com for more info.",
  "The ratio is 3:1, which equals 75%.",
  "Contact us at info@company.com or call (555) 123-4567.",
  "The temperature dropped to -15°F last night.",
  "Use the following formula: E = mc²",
];

// Sentences by difficulty level
export const SENTENCES_BY_DIFFICULTY = {
  easy: ENGLISH_SENTENCES.easy,
  medium: [...ENGLISH_SENTENCES.easy, ...ENGLISH_SENTENCES.medium],
  hard: [...ENGLISH_SENTENCES.easy, ...ENGLISH_SENTENCES.medium, ...ENGLISH_SENTENCES.hard],
  programming: ENGLISH_SENTENCES.programming,
};
