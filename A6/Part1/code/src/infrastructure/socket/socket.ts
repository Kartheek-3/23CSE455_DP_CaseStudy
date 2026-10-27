
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { container } from 'tsyringe';
import { SaveMessageUseCase } from '../../application/use_cases/saveMessagechat';
import { Role } from '../../domain/models/Chat';
import { UpdateUserData } from '../../application/use_cases/User/UpdateUserData';
import { EditDriverProfile } from '../../application/use_cases/Driver/EditDriverProfile';
let io: Server;
export const initializeSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {


    // Join chat room
    socket.on('joinChat', async ({ bookingId, userId, userType }) => {
      console.log('Join chat room:', { bookingId, userId, userType });
      if (!bookingId || typeof bookingId !== 'string') {
        console.warn('Invalid bookingId:', bookingId);
        return;
      }

      socket.join(bookingId);
      io.emit('userStatusUpdate', {
        userId,
        onlineStatus: 'online',
        lastSeen: new Date().toISOString(),
      });


      if (userType === 'user') {
        const updateUser = container.resolve(UpdateUserData);
        await updateUser.execute(userId, { onlineStatus: 'online' })
      } else if (userType === 'driver') {
        const updateDriver = container.resolve(EditDriverProfile);
        await updateDriver.execute(userId, { onlineStatus: 'online' })
      }

      console.log('Joined chat room:', bookingId);
    });

    // Send message to the chat
    socket.on('sendMessage', async ({
      bookingId,
      senderId,
      senderRole,
      type,
      text,
      fileUrl,
    }: {
      bookingId: string;
      senderId: string;
      senderRole: Role;
      type: 'text' | 'image' | 'pdf';
      text?: string;
      fileUrl?: string;
    }) => {
      try {
        console.log('Send message:', { bookingId, senderId, senderRole, type, text, fileUrl });

        const validRoles: Role[] = ['User', 'Driver', 'Admin'];
        const validTypes = ['text', 'image', 'pdf', 'doc'];

        // ✅ Validate inputs
        if (
          !bookingId ||
          !senderId ||
          !validRoles.includes(senderRole) ||
          !validTypes.includes(type)
        ) {
          socket.emit('messageError', { error: 'Invalid message payload' });
          return;
        }

        // Type-specific validation
        if (type === 'text' && !text) {
          socket.emit('messageError', { error: 'Text message must include text' });
          return;
        }

        if ((type === 'image' || type === 'pdf') && !fileUrl) {
          socket.emit('messageError', { error: `${type.toUpperCase()} must include fileUrl` });
          return;
        }






        // ✅ Save message to DB via use case
        const saveMessageToChat = container.resolve(SaveMessageUseCase);
        const newmsg = await saveMessageToChat.execute({
          bookingId,
          senderId,
          senderRole,
          type,
          text,
          fileUrl,
        });

        // ✅ Emit message immediately to the chat room
        io.to(bookingId).emit('receiveMessage', newmsg);

        // ✅ Acknowledge to sender
        socket.emit('messageSent', {
          status: 'success',
          message: newmsg,
        });



      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', {
          error: 'Internal server error while sending message',
        });
      }
    });
    socket.on('messageDeleted', ({ roomId, messageId }) => {
      try {
        console.log('Message deleted:', { roomId, messageId });

        if (!roomId || !messageId) {
          socket.emit('deleteMessageError', { error: 'Invalid bookingId or messageId' });
          return;
        }
        io.to(roomId).emit('messageDeleted', messageId);

      } catch (error: any) {
        console.error('Error deleting message:', error);
        socket.emit('deleteMessageError', {
          error: 'Internal server error while deleting message',
        });
      }

    })

    socket.on('leaveChat', async ({ bookingId, userId, userType }) => {

      try {
        socket.leave(bookingId);
        io.emit('userStatusUpdate', {
          userId,
          onlineStatus: 'offline',
          lastSeen: new Date().toISOString(),
        });
        if (userType === 'user') {
          const updateUser = container.resolve(UpdateUserData);
          await updateUser.execute(userId, { onlineStatus: 'offline', lastSeen: new Date() })
        } else if (userType === 'driver') {
          const updateDriver = container.resolve(EditDriverProfile);
          await updateDriver.execute(userId, { onlineStatus: 'offline', lastSeen: new Date() })
        }


      } catch (error: any) {
        console.error('Error leaving chat:', error);
        socket.emit('leaveChatError', {
          error: 'Internal server error while leaving chat',
        });

      }


    })
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected:now', socket.id);
    });
  });
};


export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io server not initialized");
  return io;
};
