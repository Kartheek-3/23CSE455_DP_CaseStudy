/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { EventService, EVENT_ERRORS } from '@/core/EventService.js';

export const meta = {
	tags: ['events'],
	requireCredential: true,
	kind: 'write:events',
	limit: {
		duration: ms('1hour'),
		max: 60,
	},
	res: {
		type: 'object',
		optional: false,
		nullable: false,
	},
	errors: EVENT_ERRORS,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		eventId: { type: 'string', format: 'misskey:id' },
	},
	required: ['eventId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private eventService: EventService,
	) {
		super(meta, paramDef, async (ps, me) => {
			return await this.eventService.cancel(me, ps.eventId);
		});
	}
}
