import { Router  } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { createNote, deleteNoteById, getAllNotes, getNoteById, updateNoteById } from "../controllers/noteController";

const noteRouter = Router();

noteRouter.post(
  '/create',
  authenticate,
  createNote
)

noteRouter.get(
  '/all',
  authenticate,
  getAllNotes
);

noteRouter.get(
  '/:id',
  authenticate,
  getNoteById
);

noteRouter.put(
  '/update/:id',
  authenticate,
  updateNoteById
)

noteRouter.delete(
  '/delete/:id',
  authenticate,
  deleteNoteById
)


export default noteRouter;

