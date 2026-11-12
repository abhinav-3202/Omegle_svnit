import {randomBytes} from 'crypto';

const tickets = new Map();
const TICKET_TTL_MS = 600*1000;

export const createWebSocketTicket = (userId)=>{
    const now = Date.now();

    for(const [ticket,data] of tickets.entries()){
        if(data.expiresAt<= now){
            tickets.delete(ticket);
        }
    }

    const ticket = randomBytes(32).toString('base64url');
    
    tickets.set(ticket,{
        userId,
        expiresAt: now + TICKET_TTL_MS
    })

    return ticket;
}

export const consumeWebSocketTicket = (ticket)=>{
    const data = tickets.get(ticket);

    tickets.delete(ticket);

    if(!data || data.expiresAt <= Date.now()){
        return null;
    }

    return data;
}