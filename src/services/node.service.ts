import { NodeType } from "../entities/node/nodeEntity";
import { Node } from "../entities/node/nodeEntity";
import { AppDataSource } from "../config/data-source";
import APIError, { HttpStatusCode } from "../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../utils/constant";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

interface TreeNode extends Node {
  children?: TreeNode[]; // Add children property
}
export class NodeService {
  private nodeRepo = AppDataSource.getRepository(Node);
  async createNode(
    name: string,
    color: string,
    parentId: string | null,
    type: NodeType
  ) {
    try {
      const node = new Node();
      node.nodeid = uuidv4(); // Generate a unique ID for the node
      node.nodename = name;
      node.nodeColour = color;
      node.nodetype = type;

      // Handle ORGANIZATION node specifically
      if (type === NodeType.ORGANIZATION && parentId === null) {
        node.parentId = null;
      } else {
        if (parentId === null) {
          throw new APIError(
            ErrorCommonStrings.BAD_INPUT,
            HttpStatusCode.BAD_REQUEST,
            false,
            "Parent id cannot be null"
          );
        }

        const parent = await this.nodeRepo.findOneBy({ nodeid: parentId });

        if (!parent) {
          throw new APIError(
            ErrorCommonStrings.NOT_FOUND,
            HttpStatusCode.NOT_FOUND,
            false,
            "Parent not found"
          );
        }

        logger.info(`Parent found with ID: ${parent.nodeid}`);

        // Use parentId and newly created nodeId or existing node ID to detect cycle
        const isCycleDetected = await this.cycleDetectionService(
          parentId,
          node.nodeid
        );

        if (isCycleDetected) {
          throw new APIError(
            ErrorCommonStrings.NOT_IMPLEMENTED,
            HttpStatusCode.NOT_IMPLEMENTED,
            false,
            "Cycle detected"
          );
        }

        node.parentId = parentId;
        console.log("parentNodeType", parent.nodetype);

        // Handle color inheritance based on parent's type
        if (
          parent.nodetype === NodeType.LOCATION ||
          parent.nodetype === NodeType.EMPLOYEE ||
          parent.nodetype === NodeType.DEPARTMENTS
        ) {
          node.nodeColour = parent.nodeColour;
        }
      }

      // Save the node
      const savedNode = await this.nodeRepo.save(node);
      return savedNode;
    } catch (error) {
      logger.error("Error in creating node service", error);
      if (error instanceof APIError) {
        return error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Internal server error"
      );
    }
  }

  async getOrganizationTree(id: string) {
    try {
      const rootNode = await this.nodeRepo.findOne({ where: { nodeid: id } });
      if (!rootNode) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Root node not found"
        );
      }
      const buildTree = async (parentId: string): Promise<Node[]> => {
        const children = await this.nodeRepo.find({ where: { parentId } });
        const tree: Node[] = [];

        for (const child of children) {
          const childTree = await buildTree(child.nodeid);
          tree.push({ ...child, children: childTree } as TreeNode);
        }

        return tree;
      };

      // Start building the tree from the root node
      const organizationTree = {
        ...rootNode,
        children: await buildTree(rootNode.nodeid), // Get children recursively
      };
      return organizationTree;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Internal server error"
      );
    }
  }
  async cycleDetectionService(
    parentId: string,
    nodeId: string
  ): Promise<boolean> {
    let currentParentId: string | null = parentId;

    logger.info(
      `Checking cycle: currentParentId = ${currentParentId}, nodeId = ${nodeId}`
    );

    // Immediate parent-child cycle detection
    if (currentParentId === nodeId) {
      logger.info("Cycle detected at direct relationship level.");
      return true;
    }

    // Traverse upward through the hierarchy
    while (currentParentId !== null) {
      if (currentParentId === nodeId) {
        logger.info("Cycle detected during traversal.");
        return true; // Cycle detected
      }

      const parentNode = await this.nodeRepo.findOne({
        where: { nodeid: currentParentId },
        select: ["parentId"],
      });

      // If no parent is found, stop traversal
      if (!parentNode) break;

      currentParentId = parentNode.parentId;
    }

    return false;
  }
}
