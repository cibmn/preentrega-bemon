import { Router } from "express";
import { createTicket, getUserTickets } from "../controllers/ticketController.js";
import { jwtAuth } from "../middlewares/jwtAuth.js";

const router = Router();

// Crear un nuevo ticket
router.post("/", jwtAuth, createTicket);

// Obtener los tickets del usuario autenticado
router.get("/", jwtAuth, getUserTickets);

export default router;
