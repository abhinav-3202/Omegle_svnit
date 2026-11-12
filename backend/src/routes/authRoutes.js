import express from 'express';
import * as authController from '../controllers/authController.js';
import {verifyJWT} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register",authController.registerUser);
router.post("/login",authController.loginUser);
router.post("/ws-ticket",verifyJWT,authController.issueWebSocketTicket);
export default router;