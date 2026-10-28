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
	requireAdmin: true,
	kind: 'write:admin:links',
	limit: {
		duration: ms('1hour'),
		max: 60,
	},
	res: {
		type: 'object',
		optional: false,
		nullable: false,
		properties: {
			success: { type: 'boolean' },
			domain: { type: 'string' },
			action: { type: 'string' },
		},
		required: ['success', 'domain', 'action'],
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		domain: { type: 'string', minLength: 1 },
		action: {
			type: 'string',
			enum: ['block', 'allow', 'remove'],
		},
	},
	required: ['domain', 'action'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private linkSafetyService: LinkSafetyService,
	) {
		super(meta, paramDef, async (ps) => {
			this.linkSafetyService.updateDomainRule(ps.domain, ps.action as 'block' | 'allow' | 'remove');
			return {
				success: true,
				domain: ps.domain,
				action: ps.action,
			};
		});
	}
}
