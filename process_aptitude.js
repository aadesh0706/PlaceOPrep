const fs = require('fs');
const path = require('path');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('Aptitude_Questions.json', 'utf8'));

// Task 1: Split into 3 files
const categories = {
  technical_questions: [],
  logical_reasoning: [],
  mathematical_aptitude: []
};

data.forEach(item => {
  if (item.category.includes('technical_questions')) {
    categories.technical_questions.push(item);
  }
  if (item.category.includes('logical_reasoning')) {
    categories.logical_reasoning.push(item);
  }
  if (item.category.includes('mathematical_aptitude')) {
    categories.mathematical_aptitude.push(item);
  }
});

// Remove duplicates and sort by question_no
Object.keys(categories).forEach(cat => {
  const unique = categories[cat].filter((item, index, self) =>
    index === self.findIndex(i => i.question_no === item.question_no)
  );
  categories[cat] = unique.sort((a, b) => a.question_no - b.question_no);
});

// Task 2: Add unique IDs
const idCounters = {};
const primaryPriority = ['technical_questions', 'logical_reasoning', 'mathematical_aptitude'];

function getPrimaryCategory(cats) {
  for (let pri of primaryPriority) {
    if (cats.includes(pri)) return pri;
  }
  return cats[0]; // fallback
}

function pad(num) {
  return num.toString().padStart(3, '0');
}

Object.keys(categories).forEach(cat => {
  categories[cat].forEach(item => {
    const primary = getPrimaryCategory(item.category);
    const key = `${item.company_tag}_${primary}`;
    if (!idCounters[key]) idCounters[key] = 0;
    idCounters[key]++;
    item.id = `${item.company_tag}_${primary}_${pad(idCounters[key])}`;
  });
});

// Task 3: Convert options to strings
Object.values(categories).flat().forEach(item => {
  Object.keys(item.options).forEach(key => {
    item.options[key] = item.options[key].toString();
  });
});

// Write the 3 files
fs.writeFileSync('technical_questions.json', JSON.stringify(categories.technical_questions, null, 2));
fs.writeFileSync('logical_reasoning.json', JSON.stringify(categories.logical_reasoning, null, 2));
fs.writeFileSync('mathematical_aptitude.json', JSON.stringify(categories.mathematical_aptitude, null, 2));

// Task 4: Generate Mongoose schema
const schemaContent = `import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  question_no: { type: Number, required: true },
  question: { type: String, required: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  answer: { type: String, enum: ["A", "B", "C", "D"], required: true },
  company_tag: { type: String, required: true },
  category: { type: [String], required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true }
}, { timestamps: true });

export default mongoose.model("Question", questionSchema);
`;

fs.writeFileSync('question.model.js', schemaContent);

// Task 5: Validate answers
const allQuestions = Object.values(categories).flat();
const invalidAnswers = [];

allQuestions.forEach(item => {
  const validAnswers = ['A', 'B', 'C', 'D'];
  if (!validAnswers.includes(item.answer)) {
    invalidAnswers.push({
      id: item.id,
      question_no: item.question_no,
      expected_answer: item.answer,
      issue: "Invalid option key"
    });
  } else if (!item.options[item.answer]) {
    invalidAnswers.push({
      id: item.id,
      question_no: item.question_no,
      expected_answer: item.answer,
      issue: "Missing option"
    });
  }
});

const report = invalidAnswers.length > 0 ? { invalid_answers: invalidAnswers } : { status: "All answers are valid." };

fs.writeFileSync('invalid_answer_report.json', JSON.stringify(report, null, 2));

// Summary
const summary = {
  total_questions: data.length,
  technical_questions: categories.technical_questions.length,
  logical_reasoning: categories.logical_reasoning.length,
  mathematical_aptitude: categories.mathematical_aptitude.length,
  ids_generated: allQuestions.length,
  options_converted: allQuestions.length,
  schema_generated: true,
  validation_report: report
};

console.log('Processing complete. Summary:', summary);