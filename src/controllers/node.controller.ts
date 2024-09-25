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
        NodeType.ORGANIZATION,
        null
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
    const { name, color, parentId, orgId } = req.body;

    if (!name || name.trim() == "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the name",
      });
    }
    if (!parentId || parentId.trim() == "" || typeof parentId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the parentId",
      });
    }
    if (!orgId || orgId.trim() === "" || typeof orgId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the organization ID",
      });
    }
    try {
      const node = await nodeService.createNode(
        name,
        color,
        parentId,
        NodeType.LOCATION,
        orgId
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
    const { name, color, parentId, orgId } = req.body;

    if (!name || name.trim() == "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the name",
      });
    }
    if (!parentId || parentId.trim() == "" || typeof parentId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the parentId",
      });
    }

    if (!orgId || orgId.trim() === "" || typeof orgId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the organization ID",
      });
    }
    try {
      const node = await nodeService.createNode(
        name,
        color,
        parentId,
        NodeType.EMPLOYEE,
        orgId
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
    const { name, color, parentId, orgId } = req.body;

    if (!name || name.trim() == "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the name",
      });
    }
    if (!parentId || parentId.trim() == "" || typeof parentId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the parentId",
      });
    }
    if (!orgId || orgId.trim() === "" || typeof orgId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the organization ID",
      });
    }
    try {
      const node = await nodeService.createNode(
        name,
        color,
        parentId,
        NodeType.DEPARTMENTS,
        orgId
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
  async deleteNode(req: Request, res: Response) {
    const id = req.params.id;
    const { deleteAllChildren } = req.query;

    if (!id) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing id in request",
      });
    }
    if (!deleteAllChildren) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing query params",
      });
    }
    const deleteChildren = deleteAllChildren === "true";
    try {
      const deleteNode = await nodeService.deleteNode(id, deleteChildren);
      return res.status(HttpStatusCode.OK).json({
        message: `Node deletion ${deleteNode ? "success" : "failed"}`,
      });
    } catch (error) {
      logger.error("Error deleting node", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || localConstant.ERROR_DELETING_NODE,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_DELETING_NODE,
      });
    }
  }
  async updateNode(req: Request, res: Response) {
    const { parentId, name, color } = req.body;
    const id = req.params.id;
    const { shiftAllNodes } = req.query;
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

    const isShiftAllNodes = shiftAllNodes === "true";

    try {
      const node = await nodeService.updateNode(
        parentId,
        name,
        color,
        isShiftAllNodes,
        id
      );
      return res.status(HttpStatusCode.OK).json(node);
    } catch (error) {
      logger.error("Error updating node", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || localConstant.ERROR_UPDATING_NODE,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_UPDATING_NODE,
      });
    }
  }
}
