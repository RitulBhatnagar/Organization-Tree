import { NodeType } from "../entities/node/nodeEntity";
import { Node } from "../entities/node/nodeEntity";
import { Organization } from "../entities/organization/organizationEntity";
import { AppDataSource } from "../config/data-source";
import APIError, { HttpStatusCode } from "../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../utils/constant";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

interface TreeNode extends Node {
  children?: TreeNode[]; // Add children property
}

const colorPool = [
  "#F6AF8E",
  "#C3A5FF",
  "#B1D0A5",
  "#F6ED8E",
  "#8EF4F6",
  "#C0F68E",
  "#F68ECB",
  "#8E97F6",
  "#F68EAB",
  "#F6CE8E",
  "#DFF68E",
];
export class NodeService {
  private nodeRepo = AppDataSource.getRepository(Node);
  private organizationRepo = AppDataSource.getRepository(Organization);
  private colorIndex = 0;
  async createNode(
    name: string,
    color: string | null,
    parentId: string | null,
    type: NodeType,
    orgId: string | null // Organization ID for linking node to organization
  ) {
    try {
      const node = new Node();
      node.nodeid = uuidv4();
      node.nodename = name;
      node.nodetype = type;

      // Handle Organization node creation (Save in both Organization and Node tables)
      if (type === NodeType.ORGANIZATION) {
        // Save in Organization table
        const organization = new Organization();
        organization.orgName = name;

        const savedOrganization = await this.organizationRepo.save(
          organization
        );
        logger.info(`Organization created with ID: ${savedOrganization.orgId}`);

        if (color === null) {
          color = "#FFFFFF";
        }

        // Now save in Node table, linking the organization
        node.organization = savedOrganization;
        node.nodename = savedOrganization.orgName; // Use organization name
        node.nodeid = savedOrganization.orgId; // Use the same ID for the node
        node.nodeColour = color;

        // Save the node for this organization
        const savedNode = await this.nodeRepo.save(node);
        logger.info(`Organization node created with ID: ${savedNode.nodeid}`);

        return savedNode; // Return the node along with the organization
      }

      // Link node to organization
      if (orgId) {
        const organization = await this.organizationRepo.findOneBy({ orgId });
        if (!organization) {
          logger.error(`Organization with ID: ${orgId} not found`);
          throw new APIError(
            ErrorCommonStrings.NOT_FOUND,
            HttpStatusCode.NOT_FOUND,
            false,
            "Organization not found"
          );
        }
        node.organization = organization;
      }

      // Assign colors for Location and Department nodes using round-robin from color pool
      if (type === NodeType.LOCATION || type === NodeType.DEPARTMENTS) {
        node.nodeColour = colorPool[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % colorPool.length; // Update color index
      } else {
        node.nodeColour = "white";
      }

      // Handle parent-child relationships for non-organization nodes
      if (parentId !== null) {
        const parent = await this.nodeRepo.findOneBy({ nodeid: parentId });
        if (!parent) {
          logger.error(`Parent with ID: ${parentId} not found`);
          throw new APIError(
            ErrorCommonStrings.NOT_FOUND,
            HttpStatusCode.NOT_FOUND,
            false,
            "Parent not found"
          );
        }

        node.parentId = parentId;

        // Propagate color if parent is LOCATION or DEPARTMENTS
        if (
          parent.nodetype === NodeType.LOCATION ||
          parent.nodetype === NodeType.DEPARTMENTS
        ) {
          node.nodeColour = parent.nodeColour;
        }

        // Cycle detection logic remains the same
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

  async updateNode(
    parentId: string,
    name: string,
    color: string,
    shiftAllNodes: boolean,
    id: string
  ) {
    try {
      const node = await this.nodeRepo.findOneBy({ nodeid: id });

      if (!node) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Node not found"
        );
      }

      // if node is organization
      if (node && node.nodetype === NodeType.ORGANIZATION) {
        node.nodename = name;
        node.nodeColour = color;
        node.parentId = null;

        return await this.nodeRepo.save(node);
      }

      // if everything is same

      if (
        node.parentId === parentId &&
        node.nodeColour === color &&
        node.nodename === name
      ) {
        return node;
      }

      // check if node have children

      const checkChildrenNode = async (parentId: string): Promise<Node[]> => {
        const children = await this.nodeRepo.find({ where: { parentId } });
        const tree: Node[] = [];

        for (const child of children) {
          const childTree = await checkChildrenNode(child.nodeid);
          tree.push({ ...child, children: childTree } as TreeNode);
        }
        return tree;
      };

      const childrenTree = {
        children: await checkChildrenNode(node.nodeid),
      };

      // check if the given parent id  is equal to current parent id
      if (node.parentId === parentId) {
        node.nodeColour = color;
        node.nodename = name;

        if (childrenTree.children.length > 0) {
          // update all the children nodes
          for (const child of childrenTree.children) {
            await this.nodeRepo.update(
              { nodeid: child.nodeid },
              { nodeColour: color }
            );
          }

          await this.nodeRepo.save(node);
          return node;
        }
      }

      // adding check that the node doesn't create the cycle
      let isCycleDetected = false;

      isCycleDetected = await this.cycleDetectionService(parentId, node.nodeid);
      if (isCycleDetected) {
        throw new APIError(
          ErrorCommonStrings.NOT_IMPLEMENTED,
          HttpStatusCode.NOT_IMPLEMENTED,
          false,
          "Cycle detected"
        );
      }
      // if not then first check that the given parent id exsist in the organization tree or not

      const parent = await this.nodeRepo.findOneBy({ nodeid: parentId });

      if (!parent) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Parent not found"
        );
      }
      // shift all nodes

      if (shiftAllNodes) {
        node.nodeColour = parent.nodeColour;
        node.nodename = name;
        node.parentId = parent.nodeid;

        if (childrenTree.children.length > 0) {
          for (const child of childrenTree.children) {
            await this.nodeRepo.update(
              { nodeid: child.nodeid },
              { nodeColour: node.nodeColour }
            );
          }
        }

        await this.nodeRepo.save(node);
        return node;
      }
      // if don't need to shift all children nodes then we just need to update that children nodes to the parent node and current node to new parent node
      else {
        let currentNodeParentId = node.parentId;
        if (!currentNodeParentId) {
          throw new APIError(
            ErrorCommonStrings.NOT_FOUND,
            HttpStatusCode.NOT_FOUND,
            false,
            "Current Node Parent id not found"
          );
        }
        if (childrenTree.children.length > 0) {
          const currentNodeParent = await this.nodeRepo.findOneBy({
            nodeid: currentNodeParentId,
          });

          for (const child of childrenTree.children) {
            await this.nodeRepo.update(
              { nodeid: child.nodeid },
              {
                parentId: currentNodeParent?.nodeid,
                nodeColour: currentNodeParent?.nodeColour,
              }
            );
          }
        }

        node.nodeColour = parent.nodeColour;
        node.nodename = name;
        node.parentId = parent.nodeid;
        await this.nodeRepo.save(node);
        return node;
      }
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

  async deleteNode(id: string, deleteAllChildren: boolean) {
    try {
      const node = await this.nodeRepo.findOneBy({ nodeid: id });

      if (!node) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Node not found"
        );
      }

      if (node.nodetype === NodeType.ORGANIZATION) {
        throw new APIError(
          ErrorCommonStrings.BAD_REQUEST,
          HttpStatusCode.BAD_REQUEST,
          false,
          "Organization cannot be deleted"
        );
      }
      // check if the node has children

      const checkChildrenNode = async (parentId: string): Promise<Node[]> => {
        const children = await this.nodeRepo.find({ where: { parentId } });
        const tree: Node[] = [];

        for (const child of children) {
          const childTree = await checkChildrenNode(child.nodeid);
          tree.push({ ...child, children: childTree } as TreeNode);
        }
        return tree;
      };

      const childrenTree = {
        children: await checkChildrenNode(node.nodeid),
      };

      // check if children need to be deleted
      if (deleteAllChildren) {
        // first delete the children node
        if (childrenTree.children.length > 0) {
          for (const child of childrenTree.children) {
            await this.nodeRepo.delete({ nodeid: child.nodeid });
          }
        }
        //  delete the parent node
        const deleteParent = await this.nodeRepo.delete({ nodeid: id });

        logger.info(`Node deleted successfully ${deleteParent}`);

        return true;
      }

      // if not then first check that the parent exsist for the node that need to be deleted

      let currentParentNodeId = node.parentId;
      if (currentParentNodeId) {
        const parent = await this.nodeRepo.findOneBy({
          nodeid: currentParentNodeId,
        });
        if (!parent) {
          throw new APIError(
            ErrorCommonStrings.NOT_FOUND,
            HttpStatusCode.NOT_FOUND,
            false,
            "Parent for current Node not found"
          );
        }

        if (childrenTree.children.length > 0) {
          for (const child of childrenTree.children) {
            await this.nodeRepo.update(
              { nodeid: child.nodeid },
              { parentId: parent.nodeid, nodeColour: parent.nodeColour }
            );
          }
        }

        await this.nodeRepo.delete({ nodeid: id });

        return true;
      } else {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Parent for current Node not found"
        );
      }
    } catch (error) {
      logger.error("error while deleting node service", error);
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
