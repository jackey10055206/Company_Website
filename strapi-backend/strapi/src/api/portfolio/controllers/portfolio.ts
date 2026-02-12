/**
 * portfolio controller
 *
 * IMPORTANT:
 * Strapi v5 Draft & Publish may auto-publish entries via REST (publishedAt set).
 * We must ensure the public website can ONLY read approved items.
 *
 * Rule:
 * - If request has no Authorization header (public): only allow status=approved.
 * - If authenticated (API token / admin): allow all.
 */

import { factories } from '@strapi/strapi';

function isApproved(data: any) {
  // Your workflow field is review_status
  const status = data?.review_status ?? data?.attributes?.review_status ?? data?.status ?? data?.attributes?.status;
  return String(status || '') === 'approved';
}

export default factories.createCoreController('api::portfolio.portfolio', ({ strapi }) => ({
  async create(ctx) {
    // Workflow:
    // - super (and other contributors) => always pending (cannot self-approve)
    // - jackey (admin/editor) => auto-approved on create (so no "self-review" loop)
    const user = (ctx.state as any)?.user;
    const username = String(user?.username || '').toLowerCase();
    const email = String(user?.email || '').toLowerCase();
    const isJackey = username === 'jackey' || email.startsWith('jackey@');

    const body: any = ctx.request.body || {};
    const data: any = body.data || body;

    if (data && typeof data === 'object') {
      if (isJackey) {
        // Default to approved if not explicitly set
        if (!data.review_status) data.review_status = 'approved';
      } else {
        // Force pending for non-jackey creates (ignore any incoming value)
        data.review_status = 'pending';
      }

      // Ensure we write back in the same shape
      if (body.data) body.data = data;
      else ctx.request.body = data;
    }

    // @ts-ignore
    return await super.create(ctx);
  },

  async find(ctx) {
    const hasAuth = Boolean(ctx.request.headers.authorization);

    if (!hasAuth) {
      const q: any = ctx.query || {};
      q.filters = {
        ...(q.filters || {}),
        review_status: { $eq: 'approved' },
      };
      ctx.query = q;
    }

    // @ts-ignore - super is provided by Strapi factories
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const hasAuth = Boolean(ctx.request.headers.authorization);

    // @ts-ignore
    const res = await super.findOne(ctx);

    if (!hasAuth) {
      const data = (res as any)?.data ?? (res as any);
      if (!isApproved(data)) {
        return ctx.notFound();
      }
    }

    return res;
  },

  async update(ctx) {
    // Prevent non-jackey users from changing review_status via update
    const user = (ctx.state as any)?.user;
    const username = String(user?.username || '').toLowerCase();
    const email = String(user?.email || '').toLowerCase();
    const isJackey = username === 'jackey' || email.startsWith('jackey@');

    if (!isJackey) {
      const body: any = ctx.request.body || {};
      const data: any = body.data || body;
      if (data && typeof data === 'object' && 'review_status' in data) {
        delete data.review_status;
        if (body.data) body.data = data;
        else ctx.request.body = data;
      }
    }

    // @ts-ignore
    return await super.update(ctx);
  },
}));
