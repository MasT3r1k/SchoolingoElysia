import { Elysia, t } from "elysia";
import { updateService } from "../../../../functions/update.service";
import { db } from "../../../../../database";

export const update = new Elysia({ prefix: "/system/update" })
    .get("/status", () => {
        return updateService.getStatus();
    })
    .post("/trigger", async () => {
        const result = await updateService.performUpdate();
        return result;
    })
    .post("/rollback", async ({ body }) => {
        const result = await updateService.rollback(body.backupFilename, body.commitHash);
        return result;
    }, {
        body: t.Object({
            backupFilename: t.String(),
            commitHash: t.Optional(t.String())
        })
    })
    .post("/config", async ({ body }) => {
        await db.updateTable('schools')
            .set({
                auto_update: body.auto_update ? 1 : 0,
                auto_update_interval: body.auto_update_interval
            })
            .execute();
        
        if (body.auto_update) {
            updateService.startScheduler(body.auto_update_interval);
        } else {
            updateService.stopScheduler();
        }

        return { success: true };
    }, {
        body: t.Object({
            auto_update: t.Boolean(),
            auto_update_interval: t.Number()
        })
    });

export default update;
