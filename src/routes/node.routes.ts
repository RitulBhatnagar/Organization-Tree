import { Router } from "express";
import { NodeController } from "../controllers/node.controller";

const router = Router();

const nodeController = new NodeController();

router.post("/organization", nodeController.createOrganization);
router.post("/department", nodeController.createDepartment);
router.post("/location", nodeController.createLocation);
router.post("/employee", nodeController.createEmployee);
router.get("/:id", nodeController.getTree);
router.patch("/:id", nodeController.updateNode);
router.delete("/:id", nodeController.deleteNode);

export default router;
