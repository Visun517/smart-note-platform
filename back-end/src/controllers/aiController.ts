import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import axios from "axios";
import { Note } from "../models/note.modle";
import { Quiz } from "../models/quizQuestion.modle";
import { Flashcard } from "../models/flashCard.modle";

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const maxToken = req.query.maxToken
      ? parseInt(req.query.maxToken as string, 10)
      : undefined;
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const text = note.html || note.json || "";

    // Logic to get the summary of the note using AI service

    const aiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: `Summarize this note in simple language:\n\n${text}` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: maxToken || 150,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const summary =
      aiResponse.data?.candidates?.[0]?.content || "No summary available.";

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: "Ai summerization is Failed...!" });
  }
};

export const getExplanation = async (req: AuthRequest, res: Response) => {

  try {
    const maxToken = req.query.maxToken
      ? parseInt(req.query.maxToken as string, 10)
      : undefined;
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const text = note.html || note.json || "";

    // Logic to get the summary of the note using AI service

    const aiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: `Give me an explanation for this note:\n\n${text}` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: maxToken || 150,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const summary =
      aiResponse.data?.candidates?.[0]?.content || "No explanation available.";

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: "Ai explanation is Failed...!" });
  }
};


export const getQuizQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const maxToken = req.query.maxToken
      ? parseInt(req.query.maxToken as string, 10)
      : 500;

    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const text = note.html;

    // ---- AI REQUEST ----
    const prompt = `
      Create 5 multiple-choice quiz questions based on this note.

      For EACH question, return JSON ONLY in this format:

      {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "B"
      }

      Note Content:
      ${text}
    `;

    const aiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxToken }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    let rawText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ message: "AI did not return valid quiz data." });
    }

    // ---- CLEAN JSON ----
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "");
    let quizJson;

    try {
      quizJson = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({ message: "Failed to parse AI quiz JSON." });
    }

    // ---- SAVE TO DATABASE ----
    const quiz = await Quiz.create({
      noteId: note._id,
      userId: req.user.sub,
      questions: quizJson
    });

    res.status(200).json({
      message: "Quiz generated successfully!",
      quiz
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "AI quiz generation failed!" });
  }
};

export const getFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const maxToken = req.query.maxToken
      ? parseInt(req.query.maxToken as string, 10)
      : 400;

    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const text = note.html;

    // ---------------- AI PROMPT ----------------
    const prompt = `
      Create 6 flashcards based on this study note.
      Return ONLY a JSON array. No explanation, no extra text.

      Each flashcard must follow exactly this structure:

      {
        "front": "Term or question",
        "back": "Short explanation or answer"
      }

      Note Content:
      ${text}
    `;

    // ---------------- AI REQUEST ----------------
    const aiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxToken }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    let rawText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) return res.status(500).json({ message: "AI returned no data" });

    // ---------------- CLEAN JSON ----------------
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let flashcardsJson;

    try {
      flashcardsJson = JSON.parse(rawText);
    } catch (err) {
      console.log(rawText);
      return res.status(500).json({ message: "Failed to parse AI flashcards JSON" });
    }

    // ---------------- SAVE EACH FLASHCARD ----------------
    const savedFlashcards = [];

    for (const card of flashcardsJson) {
      const saved = await Flashcard.create({
        noteId: note._id,
        userId: req.user.sub,
        front: card.front,
        back: card.back
      });

      savedFlashcards.push(saved);
    }

    res.status(200).json({
      message: "Flashcards generated successfully!",
      flashcards: savedFlashcards
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "AI flashcard generation failed!" });
  }
};
