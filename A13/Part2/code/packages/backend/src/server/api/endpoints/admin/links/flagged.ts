/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { LinkSafetyService } from '@/core/security/LinkSafetyService.js';

export const meta = {
	tags: ['admin', 'security'],
	requireCredential: true,
	requireModerator: true,
	kind: 'read:admin:links',
	limit: {
		duration: ms('1hour'),
		max: 100,
	},
	res: {
		type: 'array',
		optional: false,
		nullable: false,
		items: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				url: { type: 'string' },
				canonicalUrl: { type: 'string' },
				domain: { type: 'string' },
				riskCategory: { type: 'string' },
				reason: { type: 'string' },
				threatType: { type: 'string' },
				source: { type: 'string' },
				userId: { type: 'string', nullable: true },
				noteId: { type: 'string', nullable: true },
				resolved: { type: 'boolean' },
				createdAt: { type: 'string' },
				updatedAt: { type: 'string' },
			},
			required: ['id', 'url', 'canonicalUrl', 'domain', 'riskCategory', 'reason', 'resolved'],
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 30 },
		sinceId: { type: 'string', format: 'misskey:id', nullable: true },
		untilId: { type: 'string', format: 'misskey:id', nullable: true },
		unresolvedOnly: { type: 'boolean', default: false },
	},
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private linkSafetyService: LinkSafetyService,
	) {
		super(meta, paramDef, async (ps) => {
			const flagged = await this.linkSafetyService.getFlaggedLinks({
				limit: ps.limit,
				sinceId: ps.sinceId ?? undefined,
				untilId: ps.untilId ?? undefined,
				unresolvedOnly: ps.unresolvedOnly,
			});

			return flagged.map(f => ({
				id: f.id,
				url: f.url,
				canonicalUrl: f.canonicalUrl,
				domain: f.domain,
				riskCategory: f.riskCategory,
				reason: f.reason,
				threatType: f.threatType,
				source: f.source,
				userId: f.userId,
				noteId: f.noteId,
				resolved: f.resolved,
				createdAt: f.createdAt.toISOString(),
				updatedAt: f.updatedAt.toISOString(),
			}));
		});
	}
}
