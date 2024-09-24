import { Request, Response, NextFunction } from "express";
import { NodeService } from "../services/node.service";
import APIError, { HttpStatusCode } from "../middleware/errorMiddlware";
import { localConstant } from "../utils/constant";
import { NodeType } from "../entities/node/nodeEntity";
import logger from "../utils/logger";

const nodeService = new NodeService();
export class NodeController {
  async createOrganization(req: Request, res: Response) {
    const { name, color } = req.body;
    if (!name || name.trim() == "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the name",
      });
    }

    if (!color || color.trim() == "" || typeof color !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the color",
      });
    }

    try {
      const node = await nodeService.createNode(
        name,
        color,
        null,
        NodeType.ORGANIZATION
      );
      return res.status(HttpStatusCode.CREATED).json(node);
    } catch (error) {
      logger.error("Error creating organization", error);

      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || localConstant.ERROR_CREATING_ORGANIZATION,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_CREATING_ORGANIZATION,
      });
    }
  }

  async createLocation(req: Request, res: Response) {
    const { name, color, parentId } = req.body;

    if (!name || name.trim() == "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the name",
      });
    }

    if (!color || color.trim() == "" || typeof color !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the color",
      });
    }
    if (!parentId || parentId.trim() == "" || typeof parentId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the parentId",
      });
    }
    try {
      const node = await nodeService.createNode(
        name,
        color,
        parentId,
        NodeType.LOCATION
      );
      return res.status(HttpStatusCode.CREATED).json(node);
    } catch (error) {
      logger.error("Error creating location", error);

      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || localConstant.ERROR_CREATING_LOCATION,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_CREATING_LOCATION,
      });
    }
  }

  async createEmployee(req: Request, res: Response) {
    const { name, color, parentId } = req.body;

    if (!name || name.trim() == "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the name",
      });
    }

    if (!color || color.trim() == "" || typeof color !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the color",
      });
    }
    if (!parentId || parentId.trim() == "" || typeof parentId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the parentId",
      });
    }
    try {
      const node = await nodeService.createNode(
        name,
        color,
        parentId,
        NodeType.EMPLOYEE
      );
      return res.status(HttpStatusCode.CREATED).json(node);
    } catch (error) {
      logger.error("Error creating Employee", error);

      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || localConstant.ERROR_CREATING_EMPLOYEE,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_CREATING_EMPLOYEE,
      });
    }
  }

  async createDepartment(req: Request, res: Response) {
    const { name, color, parentId } = req.body;

    if (!name || name.trim() == "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the name",
      });
    }

    if (!color || color.trim() == "" || typeof color !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the color",
      });
    }
    if (!parentId || parentId.trim() == "" || typeof parentId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the parentId",
      });
    }
    try {
      const node = await nodeService.createNode(
        name,
        color,
        parentId,
        NodeType.DEPARTMENTS
      );
      return res.status(HttpStatusCode.CREATED).json(node);
    } catch (error) {
      logger.error("Error creating department", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || localConstant.ERROR_CREATING_DEPARTMENT,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_CREATING_DEPARTMENT,
      });
    }
  }
  async getTree(req: Request, res: Response) {
    const id = req.params.id;

    if (!id) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing id in request",
      });
    }
    try {
      const node = await nodeService.getOrganizationTree(id);
      return res.status(HttpStatusCode.OK).json(node);
    } catch (error) {
      logger.error("Error creating department", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || localConstant.ERROR_GETTING_ORGANIZATION,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_GETTING_ORGANIZATION,
      });
    }
  }
}
