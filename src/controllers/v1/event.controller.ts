import { Request, Response } from "express";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";
import { EventService } from "../../services/v1/event.service";

const eventService = new EventService();

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const { name, description } = req.body;

      // Input validation
      if (!name || typeof name !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing name" });
      }

      if (!description || typeof description !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing description" });
      }

      const event = await eventService.createEvent(name, description);

      return res.status(HttpStatusCode.CREATED).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      logger.error("Error in createEvent controller:", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error creating event",
      });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { name, description } = req.body;

      // Input validation
      if (!eventId || typeof eventId !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing eventId" });
      }

      if (!name || typeof name !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing name" });
      }

      if (!description || typeof description !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing description" });
      }

      const event = await eventService.updateEvent(eventId, name, description);

      return res.status(HttpStatusCode.OK).json({
        message: "Event updated successfully",
        event,
      });
    } catch (error) {
      logger.error("Error in updateEvent controller:", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error updating event",
      });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      // Input validation
      if (!eventId || typeof eventId !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing eventId" });
      }

      const event = await eventService.getEvent(eventId);

      return res.status(HttpStatusCode.OK).json({
        message: "Event retrieved successfully",
        event,
      });
    } catch (error) {
      logger.error("Error in getEvent controller:", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving event",
      });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      // Input validation
      if (!eventId || typeof eventId !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing eventId" });
      }

      await eventService.deleteEvent(eventId);

      return res.status(HttpStatusCode.OK).json({
        message: "Event deleted successfully",
      });
    } catch (error) {
      logger.error("Error in deleteEvent controller:", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting event",
      });
    }
  }
}
