import { io, Socket } from 'socket.io-client'
const socket: Socket = io(':3001')

export default socket
