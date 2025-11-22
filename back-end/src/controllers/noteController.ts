import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import { Note } from "../models/note.modle";

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, html, json, subjectId, userId } = req.body;
    const images: string[] = req.body?.images || [];
    const pdfUrl: string | undefined = req.body?.pdfUrl;

    if (!title || !html || !json || !subjectId || !userId) {
      return res.status(400).json({ message: "Note not have a content...!" });
    }

    const note = await Note.create({
      title,
      html,
      json,
      images,
      pdfUrl,
      subjectId,
      userId,
    });

    res.status(201).json({ message: "Note Created Successfully...!", data: note });

  } catch (error) {
    res.status(500).json({ message: "Note Creation Failed...!" });
  }
};

export const getAllNotes = async (req: AuthRequest, res: Response) => {

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const userId = req.user.sub;

    const totalNotesCount = await Note.countDocuments({ userId });

    const notes = await Note.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log(notes)

    const totalPages = Math.ceil(totalNotesCount / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalNotesCount,
      notes,
    });

  } catch (error) {
    res.status(500).json({ message: "Note fetched Failed...!" });
  }
};

export const getNoteById = async (req: AuthRequest, res: Response) => {

  try {
    const userId = req.user.sub;
    const noteId = req.params.id;

    const note = await Note.findOne({ userId: userId, _id: noteId });

    res.status(200).json({
      message: "Note fetched Successfully...!",
      note
    });

  } catch (error) {
    res.status(500).json({ message: "One Note fetched Failed...!" });
  }

}

export const updateNoteById = async (req: AuthRequest, res: Response) => {

  try {
    const { title, html, json, subjectId, userId } = req.body;
    const images: string[] = req.body?.images || [];
    const pdfUrl: string | undefined = req.body?.pdfUrl;

    if (!title || !html || !json || !subjectId || !userId) {
      return res.status(400).json({ message: "Note not have a content...!" });
    }

    const note = await Note.create({
      title,
      html,
      json,
      images,
      pdfUrl,
      subjectId,
      userId,
    });

    res.status(201).json({ message: "Note updated Successfully...!", data: note });

  } catch (error) {
    res.status(500).json({ message: "Note update Failed...!" });
  }
}

export const deleteNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;

    const deletedNote = await Note.findByIdAndDelete(noteId);

    res.status(200).json({ message: "Note deleted Successfully...!", data: deletedNote });
    
  } catch (error) {
    res.status(500).json({ message: "Note delete Failed...!" });
  }
}
