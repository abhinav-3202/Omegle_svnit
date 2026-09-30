import express from 'express';
import {verifyJWT} from '../middleware/authMiddleware.js';
import {joinQueue,leaveQueue,getQueue} from '../controllers/queueController.js';

const router = express.Router();

router.post("/join",verifyJWT,joinQueue);
router.delete("/leave",verifyJWT,leaveQueue);
router.get("/",verifyJWT,getQueue);

export default router;


