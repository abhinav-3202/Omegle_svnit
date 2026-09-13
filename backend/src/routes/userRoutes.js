import {verifyJWT} from '../middleware/authMiddleware.js';
import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get("/me",verifyJWT,userController.getUser);

export default router;