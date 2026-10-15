import connectionManager from "../singletons/connectionManager.js";
import matchManager from "../singletons/matchManager.js";

const sendError = (socket, message) => {
    socket.send(JSON.stringify({
        type: "ERROR",
        message
    }));
};

const isValidPayload = (type, payload) => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return false;
    }

    if (type === "WEBRTC_OFFER") {
        return payload.type === "offer"
            && typeof payload.sdp === "string"
            && payload.sdp.length > 0;
    }

    if (type === "WEBRTC_ANSWER") {
        return payload.type === "answer"
            && typeof payload.sdp === "string"
            && payload.sdp.length > 0;
    }

    if (type === "ICE_CANDIDATE") {
        return typeof payload.candidate === "string"
            && (
                payload.sdpMid === null
                || typeof payload.sdpMid === "string"
                || payload.sdpMid === undefined
            )
            && (
                payload.sdpMLineIndex === null
                || Number.isInteger(payload.sdpMLineIndex)
                || payload.sdpMLineIndex === undefined
            );
    }

    return false;
};

export const relayWebRTCSignal = (socket, userId, type, payload) => {
    if (!isValidPayload(type, payload)) {
        sendError(socket, "Invalid WebRTC signaling payload.");
        return;
    }

    const match = matchManager.getMatchByUserId(userId);

    if (!match) {
        sendError(socket, "You must be in an active match.");
        return;
    }

    const partnerId = match.participants.find(
        participantId => participantId !== userId
    );

    if (!partnerId) {
        sendError(socket, "Unable to identify your match partner.");
        return;
    }

    const delivered = connectionManager.sendMessage(partnerId, {
        type,
        senderId: userId,
        payload
    });

    if (!delivered) {
        sendError(socket, "Your partner is not connected.");
    }
};