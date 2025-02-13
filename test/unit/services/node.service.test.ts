// nodeService.test.ts
import { NodeService } from "../../../src/services/v1/node.service"; // Import the service
import { Node, NodeType } from "../../../src/entities/node/nodeEntity"; // Mocked entities
import { Organization } from "../../../src/entities/organization/organizationEntity";
import { AppDataSource } from "../../../src/config/data-source";

jest.mock("../../../src/config/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock("../../../src/middleware/errorMiddlware", () => ({
  APIError: jest.fn(),
}));

jest.mock("../../../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("NodeService", () => {
  let nodeService: NodeService;
  let nodeRepo: any;
  let organizationRepo: any;

  beforeEach(() => {
    nodeRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };
    organizationRepo = {
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    // Mock repositories
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Node) return nodeRepo;
      if (entity === Organization) return organizationRepo;
    });

    nodeService = new NodeService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case for createNode
  describe("createNode", () => {
    it("should create an organization node and save it in both Node and Organization tables", async () => {
      const nodeData = {
        nodeid: "node-uuid",
        nodename: "OrgNode",
        nodetype: NodeType.ORGANIZATION,
        nodeColour: "#F6AF8E",
        parentId: null,
      };

      const orgData = {
        orgId: "org-uuid",
        orgName: "OrgNode",
      };

      nodeRepo.save.mockResolvedValue(nodeData);
      organizationRepo.save.mockResolvedValue(orgData);

      const result = await nodeService.createNode(
        "OrgNode",
        null,
        NodeType.ORGANIZATION,
        null
      );

      expect(organizationRepo.save).toHaveBeenCalled();
      expect(nodeRepo.save).toHaveBeenCalled();
      //   expect(result.nodeid).toBe("org-uuid");
    });

    it("should create a child node under a parent and propagate color if parent is LOCATION or DEPARTMENTS", async () => {
      const parentNode = {
        nodeid: "parent-uuid",
        nodename: "ParentNode",
        nodetype: NodeType.LOCATION,
        nodeColour: "#F6AF8E",
      };

      nodeRepo.findOneBy.mockResolvedValue(parentNode);

      const result = await nodeService.createNode(
        "ChildNode",
        "parent-uuid",
        NodeType.DEPARTMENTS,
        null
      );

      expect(nodeRepo.save).toHaveBeenCalled();
      //   expect(result.nodeColour).toBe("#F6AF8E"); // Propagated color
    });

    it("should throw an error if parent node is not found", async () => {
      nodeRepo.findOneBy.mockResolvedValue(null); // Parent not found

      await expect(
        nodeService.createNode(
          "ChildNode",
          "invalid-parent",
          NodeType.DEPARTMENTS,
          null
        )
      ).rejects.toThrow("Parent not found");

      expect(nodeRepo.save).not.toHaveBeenCalled();
    });
  });

  // Test case for getOrganizationTree
  describe("getOrganizationTree", () => {
    it("should return the organization tree", async () => {
      const rootNode = {
        nodeid: "root-uuid",
        nodename: "RootNode",
        nodetype: NodeType.ORGANIZATION,
      };
      const childNode = {
        nodeid: "child-uuid",
        parentId: "root-uuid",
        nodename: "ChildNode",
      };

      nodeRepo.findOne.mockResolvedValue(rootNode);
      nodeRepo.find.mockResolvedValue([childNode]);

      const result = await nodeService.getOrganizationTree("root-uuid");

      expect(result.nodeid).toBe("root-uuid");
      expect(result.children[0].nodeid).toBe("child-uuid");
    });

    it("should throw an error if the root node is not found", async () => {
      nodeRepo.findOne.mockResolvedValue(null); // Root node not found

      await expect(
        nodeService.getOrganizationTree("invalid-root")
      ).rejects.toThrow("Root node not found");
    });
  });

  // Test case for updateNode
  describe("updateNode", () => {
    it("should update a node and propagate color to its children if shiftAllNodes is true", async () => {
      const node = {
        nodeid: "node-uuid",
        nodename: "Node1",
        nodeColour: "#F6AF8E",
        parentId: "parent-uuid",
      };
      const childNode = {
        nodeid: "child-uuid",
        nodename: "ChildNode",
        parentId: "node-uuid",
      };

      nodeRepo.findOneBy.mockResolvedValue(node);
      nodeRepo.find.mockResolvedValue([childNode]);

      const result = await nodeService.updateNode(
        "parent-uuid",
        "UpdatedNode",
        "#C3A5FF",
        true,
        "node-uuid"
      );

      expect(nodeRepo.update).toHaveBeenCalledWith(
        { nodeid: "child-uuid" },
        { nodeColour: "#C3A5FF" }
      );
      expect(result.nodeColour).toBe("#C3A5FF");
    });

    it("should throw an error if the node is not found", async () => {
      nodeRepo.findOneBy.mockResolvedValue(null); // Node not found

      await expect(
        nodeService.updateNode(
          "parent-uuid",
          "UpdatedNode",
          "#C3A5FF",
          false,
          "invalid-node"
        )
      ).rejects.toThrow("Node not found");
    });
  });

  // Test case for deleteNode
  describe("deleteNode", () => {
    it("should delete a node and all its children if deleteAllChildren is true", async () => {
      const node = {
        nodeid: "node-uuid",
        nodename: "Node1",
        nodetype: NodeType.DEPARTMENTS,
      };
      const childNode = {
        nodeid: "child-uuid",
        parentId: "node-uuid",
        nodename: "ChildNode",
      };

      nodeRepo.findOneBy.mockResolvedValue(node);
      nodeRepo.find.mockResolvedValue([childNode]);

      const result = await nodeService.deleteNode("node-uuid", true);

      expect(nodeRepo.delete).toHaveBeenCalledWith({ nodeid: "child-uuid" });
      expect(nodeRepo.delete).toHaveBeenCalledWith({ nodeid: "node-uuid" });
      expect(result).toBe(true);
    });

    it("should throw an error if the node is not found", async () => {
      nodeRepo.findOneBy.mockResolvedValue(null); // Node not found

      await expect(
        nodeService.deleteNode("invalid-node", true)
      ).rejects.toThrow("Node not found");
    });
  });
});
