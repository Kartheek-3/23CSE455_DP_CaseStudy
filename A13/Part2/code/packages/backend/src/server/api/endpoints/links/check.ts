/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { LinkSafetyService } from '@/core/security/LinkSafetyService.js';

export const meta = {
	tags: ['links', 'security'],
	requireCredential: false,
	kind: 'read:links',
	limit: {
		duration: ms('1hour'),
		max: 300,
	},
	res: {
		type: 'object',
		optional: false,
		nullable: false,
		properties: {
			results: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						url: { type: 'string' },
						canonicalUrl: { type: 'string' },
						domain: { type: 'string' },
						category: { type: 'string' },
						threatType: { type: 'string' },
						reason: { type: 'string' },
						confidence: { type: 'number' },
						provider: { type: 'string' },
						checkedAt: { type: 'string' },
					},
					required: ['url', 'canonicalUrl', 'category', 'reason'],
				},
			},
		},
		required: ['results'],
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		text: { type: 'string', nullable: true },
		urls: {
			type: 'array',
			items: { type: 'string' },
			nullable: true,
		},
	},
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private linkSafetyService: LinkSafetyService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const context = {
				userId: me?.id,
			};

			if (ps.text) {
				const results = await this.linkSafetyService.checkText(ps.text, context);
				return { results };
			}

			if (ps.urls && ps.urls.length > 0) {
				const results = await Promise.all(
					ps.urls.map(u => this.linkSafetyService.checkUrl(u, context)),
				);
				return { results };
			}

			return { results: [] };
		});
	}
}
