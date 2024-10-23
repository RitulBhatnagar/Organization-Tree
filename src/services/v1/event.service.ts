import { AppDataSource } from "../../config/data-source";
import { Event } from "../../entities/Event/eventEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";

export class EventService {
  private eventRepo = AppDataSource.getRepository(Event);
  async createEvent(name: string, description: string) {
    try {
      const event = new Event();
      event.name = name;
      event.description = description;
      await this.eventRepo.save(event);
      return event;
    } catch (error) {
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while creating event"
      );
    }
  }
  async updateEvent(eventId: string, name: string, description: string) {
    try {
      const event = await this.eventRepo.findOne({
        where: { eventId },
      });
      if (!event) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Event not found"
        );
      }
      event.name = name;
      event.description = description;
      await this.eventRepo.save(event);
      return event;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while updating event"
      );
    }
  }

  async getEvent(eventId: string) {
    try {
      const event = await this.eventRepo.findOne({
        where: { eventId },
        relations: ["task"],
        select: {
          eventId: true,
          name: true,
          description: true,
          task: {
            taskId: true,
            taskType: true,
            name: true,
          },
        },
      });
      if (!event) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Event not found"
        );
      }
      return event;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while getting event"
      );
    }
  }

  async deleteEvent(eventId: string) {
    try {
      const event = await this.eventRepo.findOne({
        where: { eventId },
      });
      if (!event) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Event not found"
        );
      }
      await this.eventRepo.remove(event);
      return event;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while deleting event"
      );
    }
  }
}
