import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .post(
    '/traineeship/remove_company',
    async ({ cookie, body }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.TRAINEESHIP_REMOVE_COMPANY);
        if (!perm) return { error: 'no_permission' };
        const { companyId, type } = body;

        // Načti firmu
        const company = await db
          .selectFrom('traineeship_companies')
          .select(['company_id'])
          .where('company_id', '=', companyId)
          .executeTakeFirst();

        if (!company) {
            return Response.json({ error: 'invalid_company_id' });
        }

        if (type === 'archive') {
            await db.updateTable('traineeship_companies')
              .set({ status: 'deleted' as any })
              .where('company_id', '=', companyId)
              .execute();
        } else if (type === 'delete') {
            await db.updateTable('traineeship_companies')
              .set({
                name: "",
                ico: "",
                dic: "",
                vat_id: "",
                web: "",
                email: "",
                phone: "",
                rp_first_name: "",
                rp_last_name: "",
                contact: "",
                description: "",
                activity: "",
                equipment: "",
                status: "deleted" as any
              })
              .where('company_id', '=', companyId)
              .execute();
        }

        return Response.json({ status: 'success' });
    },
    {
      body: t.Object({
        companyId: t.Number(),
        type: t.Union([t.Literal('archive'), t.Literal('delete')])
      }),
    }
  );

export default app;
