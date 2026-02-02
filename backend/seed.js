const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const questions = [
  // Technical Questions
  {
    title: "Two Sum Problem",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    category: "technical",
    difficulty: "intermediate",
    type: "coding",
    company: ["Google", "Amazon", "Microsoft"],
    expectedApproach: "Use a hash map to store the complement of each number. For each number, check if its complement exists in the map.",
    boilerplateCode: {
      python: "def two_sum(nums, target):\n    # Write your code here\n    pass",
      java: "public int[] twoSum(int[] nums, int target) {\n    // Write your code here\n    return new int[0];\n}",
      cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}",
      javascript: "function twoSum(nums, target) {\n    // Write your code here\n}"
    },
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]", isHidden: false },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]", isHidden: false },
      { input: "[3,3], 6", expectedOutput: "[0,1]", isHidden: true }
    ],
    hints: ["Think about using a hash table", "What's the complement of each number?"],
    timeLimit: 30,
    points: 15
  },
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    category: "technical",
    difficulty: "intermediate",
    type: "coding",
    company: ["Facebook", "Amazon", "Microsoft"],
    expectedApproach: "Iterate through the list and reverse the pointers. Use three pointers: prev, current, and next.",
    boilerplateCode: {
      python: "def reverse_list(head):\n    # Write your code here\n    pass",
      java: "public ListNode reverseList(ListNode head) {\n    // Write your code here\n    return null;\n}",
      cpp: "ListNode* reverseList(ListNode* head) {\n    // Write your code here\n    return nullptr;\n}"
    },
    timeLimit: 25,
    points: 15
  },
  {
    title: "Valid Parentheses",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets and in the correct order.",
    category: "technical",
    difficulty: "beginner",
    type: "coding",
    company: ["Google", "Amazon"],
    expectedApproach: "Use a stack data structure. Push opening brackets onto the stack and pop when encountering closing brackets. Check if they match.",
    boilerplateCode: {
      python: "def is_valid(s):\n    # Write your code here\n    pass",
      javascript: "function isValid(s) {\n    // Write your code here\n}"
    },
    timeLimit: 20,
    points: 10
  },
  {
    title: "Binary Search Implementation",
    description: "Implement binary search algorithm to find the target value in a sorted array. Return the index if found, otherwise return -1.",
    category: "technical",
    difficulty: "beginner",
    type: "coding",
    company: ["Amazon", "Microsoft", "TCS"],
    expectedApproach: "Use two pointers (left and right) and find the middle element. Compare with target and adjust pointers accordingly.",
    boilerplateCode: {
      python: "def binary_search(arr, target):\n    # Write your code here\n    pass",
      java: "public int binarySearch(int[] arr, int target) {\n    // Write your code here\n    return -1;\n}"
    },
    timeLimit: 20,
    points: 10
  },
  {
    title: "Merge Two Sorted Arrays",
    description: "Given two sorted arrays, merge them into one sorted array efficiently.",
    category: "technical",
    difficulty: "intermediate",
    type: "coding",
    company: ["Google", "Facebook", "Amazon"],
    expectedApproach: "Use two pointers approach. Compare elements from both arrays and add the smaller one to the result.",
    timeLimit: 25,
    points: 15
  },

  // HR Questions
  {
    title: "Tell me about yourself",
    description: "Introduce yourself professionally, covering your background, experience, and what makes you a good fit for this role.",
    category: "hr",
    difficulty: "intermediate",
    type: "behavioral",
    starMethodGuide: {
      situation: "Set the context of your professional background",
      task: "Explain your career goals and objectives",
      action: "Describe your key achievements and skills",
      result: "Show how your experience makes you suitable for this role"
    },
    hints: [
      "Keep it under 2 minutes",
      "Focus on relevant experience",
      "End with why you're interested in this role"
    ],
    timeLimit: 5,
    points: 10
  },
  {
    title: "Why do you want to work here?",
    description: "Explain your motivation for applying to this company and role.",
    category: "hr",
    difficulty: "intermediate",
    type: "behavioral",
    starMethodGuide: {
      situation: "Mention what attracted you to the company",
      task: "Identify what you hope to achieve here",
      action: "Explain how your skills align with company values",
      result: "Show mutual benefit - how you can contribute"
    },
    timeLimit: 3,
    points: 10
  },
  {
    title: "Describe a challenging situation at work",
    description: "Share a specific example of a difficult situation you faced and how you handled it.",
    category: "hr",
    difficulty: "advanced",
    type: "behavioral",
    starMethodGuide: {
      situation: "Describe the challenging scenario clearly",
      task: "Explain what needed to be accomplished",
      action: "Detail the steps you took to address the challenge",
      result: "Share the positive outcome and what you learned"
    },
    timeLimit: 5,
    points: 15
  },
  {
    title: "Where do you see yourself in 5 years?",
    description: "Discuss your career goals and aspirations for the future.",
    category: "hr",
    difficulty: "intermediate",
    type: "behavioral",
    timeLimit: 3,
    points: 10
  },
  {
    title: "Why should we hire you?",
    description: "Convince the interviewer why you're the best candidate for this position.",
    category: "hr",
    difficulty: "advanced",
    type: "behavioral",
    timeLimit: 3,
    points: 15
  },

  // Aptitude Questions
  {
    title: "Number Series",
    description: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    category: "aptitude",
    difficulty: "intermediate",
    type: "mcq",
    options: ["42", "40", "38", "44"],
    correctAnswer: "42",
    expectedApproach: "The pattern is n*(n+1): 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42",
    timeLimit: 2,
    points: 10
  },
  {
    title: "Logical Reasoning - Syllogism",
    description: "All managers are leaders. Some leaders are entrepreneurs. Conclusion: Some managers are entrepreneurs. Is this conclusion valid?",
    category: "aptitude",
    difficulty: "intermediate",
    type: "mcq",
    options: ["Valid", "Invalid", "Uncertain", "Partially Valid"],
    correctAnswer: "Invalid",
    expectedApproach: "The conclusion doesn't follow logically from the premises. We can't determine if any managers are entrepreneurs from the given statements.",
    timeLimit: 2,
    points: 10
  },
  {
    title: "Percentage Problem",
    description: "If 40% of 60% of a number is 144, what is the number?",
    category: "aptitude",
    difficulty: "intermediate",
    type: "mcq",
    options: ["500", "600", "700", "800"],
    correctAnswer: "600",
    expectedApproach: "Let the number be x. 0.4 * 0.6 * x = 144, so 0.24x = 144, x = 600",
    timeLimit: 3,
    points: 10
  },
  {
    title: "Time and Work",
    description: "A can complete a work in 12 days and B in 18 days. If they work together, how many days will it take?",
    category: "aptitude",
    difficulty: "intermediate",
    type: "mcq",
    options: ["6.5 days", "7.2 days", "7.5 days", "8 days"],
    correctAnswer: "7.2 days",
    expectedApproach: "A's rate = 1/12, B's rate = 1/18. Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days",
    timeLimit: 3,
    points: 10
  },
  {
    title: "Probability",
    description: "Two dice are thrown. What is the probability that the sum is greater than 9?",
    category: "aptitude",
    difficulty: "advanced",
    type: "mcq",
    options: ["1/6", "1/9", "5/36", "1/4"],
    correctAnswer: "1/6",
    expectedApproach: "Favorable outcomes: (4,6), (5,5), (5,6), (6,4), (6,5), (6,6) = 6 outcomes. Total = 36. Probability = 6/36 = 1/6",
    timeLimit: 3,
    points: 15
  },

  // General Interview Questions
  {
    title: "Walk me through your resume",
    description: "Provide a chronological overview of your professional journey.",
    category: "general",
    difficulty: "intermediate",
    type: "behavioral",
    timeLimit: 5,
    points: 10
  },
  {
    title: "What are your salary expectations?",
    description: "Discuss your compensation expectations for this role.",
    category: "general",
    difficulty: "advanced",
    type: "behavioral",
    timeLimit: 3,
    points: 10
  },
  {
    title: "Do you have any questions for us?",
    description: "Ask thoughtful questions about the role, team, or company.",
    category: "general",
    difficulty: "intermediate",
    type: "behavioral",
    timeLimit: 3,
    points: 10
  }
];

async function seedDatabase() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');

    // Insert new questions
    await Question.insertMany(questions);
    console.log(`✅ Inserted ${questions.length} questions`);

    console.log('\n📊 Question breakdown:');
    const technical = questions.filter(q => q.category === 'technical').length;
    const hr = questions.filter(q => q.category === 'hr').length;
    const aptitude = questions.filter(q => q.category === 'aptitude').length;
    const general = questions.filter(q => q.category === 'general').length;

    console.log(`   Technical: ${technical}`);
    console.log(`   HR: ${hr}`);
    console.log(`   Aptitude: ${aptitude}`);
    console.log(`   General: ${general}`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
