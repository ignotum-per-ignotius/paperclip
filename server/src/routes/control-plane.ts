import { Router } from "express";
import { inArray } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { companies } from "@paperclipai/db";
import { unauthorized } from "../errors.js";
import { boardAuthService } from "../services/index.js";
import { serverVersion } from "../version.js";

/**
 * Inbound control-plane connect surface for external products (e.g. BIZEVAL)
 * that store a Paperclip base URL + board API key and map their divisions to
 * Paperclip companies.
 *
 * Contract (thin inbound, D5 in doc/connections/README.md):
 * - Auth: `Authorization: Bearer <board API key>` (`pcp_board_…`)
 * - `GET /api/control-plane/connect` verifies the key and returns companies
 *   the key owner can access, for division ↔ company mapping.
 */
export function controlPlaneRoutes(db: Db) {
  const router = Router();
  const boardAuth = boardAuthService(db);

  router.get("/connect", async (req, res) => {
    if (req.actor.type !== "board" || !req.actor.userId) {
      throw unauthorized("Board authentication required");
    }

    const accessSnapshot = await boardAuth.resolveBoardAccess(req.actor.userId);
    const companyIds =
      req.actor.source === "local_implicit" || accessSnapshot.isInstanceAdmin
        ? null
        : accessSnapshot.companyIds;

    const rows =
      companyIds === null
        ? await db.select({
            id: companies.id,
            name: companies.name,
            issuePrefix: companies.issuePrefix,
          }).from(companies)
        : companyIds.length === 0
          ? []
          : await db
              .select({
                id: companies.id,
                name: companies.name,
                issuePrefix: companies.issuePrefix,
              })
              .from(companies)
              .where(inArray(companies.id, companyIds));

    res.json({
      ok: true,
      controlPlane: "paperclip",
      version: serverVersion,
      actor: {
        userId: req.actor.userId,
        user: accessSnapshot.user,
        isInstanceAdmin: accessSnapshot.isInstanceAdmin,
        source: req.actor.source ?? "none",
        keyId: req.actor.source === "board_key" ? req.actor.keyId ?? null : null,
      },
      companies: rows.map((row) => ({
        id: row.id,
        name: row.name,
        issuePrefix: row.issuePrefix,
      })),
    });
  });

  return router;
}
