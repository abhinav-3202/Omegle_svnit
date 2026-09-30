import * as queueService from '../services/queueService.js';

export const joinQueue = async (req, res) => {
    const user = req.user; // because of verifyJWT
    
    const result = await queueService.joinQueue(user);

    return res.status(200).json({
        success: true,
        data: result
    })
}

export const leaveQueue = async (req, res) => {
    const userId = req.user._id; 

    const result = await queueService.leaveQueue(userId);

    return res.status(200).json({
        success: true,
        data: result
    })
}

export const getQueue = async (req, res) => {
    const result = await queueService.getQueue();

    return res.status(200).json({
        success: true,
        data: result
    })

}