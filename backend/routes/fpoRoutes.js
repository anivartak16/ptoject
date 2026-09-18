import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getFpoFarmers,
  getFpoMembers,
  addFpoMember,
  removeFpoMember,
  getFpoLots,
  aggregateLots,
  getFpoMatches,
  connectFpoWithBuyer,
} from "../controllers/fpoController.js";

const router = Router();

router.get("/farmers", requireAuth, requireRole("FPO"), getFpoFarmers);
router.get("/members", requireAuth, requireRole("FPO"), getFpoMembers);
router.post("/members", requireAuth, requireRole("FPO"), addFpoMember);
router.delete("/members/:farmerId", requireAuth, requireRole("FPO"), removeFpoMember);
router.get("/lots", requireAuth, requireRole("FPO"), getFpoLots);
router.post("/aggregate", requireAuth, requireRole("FPO"), aggregateLots);
router.get("/matches", requireAuth, requireRole("FPO"), getFpoMatches);
router.post("/connect", requireAuth, requireRole("FPO"), connectFpoWithBuyer);

export default router;
