import { AppDataSource } from "../../config/data-source";
import { AssignedPerson } from "../../entities/AssignedPerson/assignedPersonEntity";
import { Inbox } from "../../entities/Inbox/inboxEntity";
import { Message } from "../../entities/Messages/messageEntity";
import { User } from "../../entities/user/userEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { PaginationParams } from "../../types";
import { ErrorCommonStrings } from "../../utils/constant";
import logger from "../../utils/logger";

export class NotificationService {
  private inboxRepo = AppDataSource.getRepository(Inbox);
  private messageRepo = AppDataSource.getRepository(Message);
  private userRepo = AppDataSource.getRepository(User);

  async createInbox(userId: string) {
    try {
      const user = await this.userRepo.findOneBy({ userId });
      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }
      const inbox = new Inbox();
      inbox.user = user;
      inbox.messages = [];
      const newInbox = await this.inboxRepo.save(inbox);
      return newInbox;
    } catch (error) {
      logger.error("Error while creating the inbox", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while creating the inbox"
      );
    }
  }
  async sendNotification(message: string, user: User) {
    try {
      let inbox = await this.inboxRepo.findOne({
        where: { user: { userId: user.userId } },
        relations: ["messages"],
      });
      if (!inbox) {
        inbox = await this.createInbox(user.userId);
      }

      const newMessage = new Message();
      newMessage.inbox = inbox;
      newMessage.message = message;
      newMessage.seen = false;
      const createdMessage = await this.messageRepo.save(newMessage);
      return createdMessage;
    } catch (error) {
      logger.error("Error while creating the notification message", error);
    }
  }

  async getNotifications(userId: string, paginationParams: PaginationParams) {
    try {
      const { page = 1, limit = 10 } = paginationParams;
      const skip = (page - 1) * limit;

      // Fetch inboxes along with their messages
      const [inboxes, total] = await this.inboxRepo.findAndCount({
        where: { user: { userId } },
        relations: ["messages"],
        take: limit,
        skip: skip,
      });

      const notifications = inboxes
        .map((inbox) => {
          if (inbox.messages.length > 0) {
            const firstMessage = inbox.messages[0];
            return {
              id: firstMessage.messageId,
              message: firstMessage.message,
              seen: firstMessage.seen,
              createdAt: firstMessage.createdAt,
            };
          }
          return null;
        })
        .filter((notification) => notification !== null);

      return {
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while getting notifications"
      );
    }
  }
  async markAsSeen(messageId: string) {
    try {
      const message = await this.messageRepo.findOneBy({ messageId });
      if (!message) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Message not found"
        );
      }
      message.seen = true;
      await this.messageRepo.save(message);
      return message;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while marking message as seen"
      );
    }
  }
}
