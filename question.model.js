import mongoose from "mongoose";

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
