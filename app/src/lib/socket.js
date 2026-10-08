import { io } from 'socket.io-client';
import { API_URL } from '../config';

// One shared socket for the whole app. Screens and the ticket alert watcher only add listeners.
export const socket = io(API_URL, { autoConnect: false });
