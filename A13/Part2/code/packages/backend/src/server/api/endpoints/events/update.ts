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
		title: { type: 'string', minLength: 1, maxLength: 128 },
		description: { type: 'string', nullable: true, maxLength: 2048 },
		startsAt: { type: 'string', format: 'date-time' },
		endsAt: { type: 'string', format: 'date-time' },
		timezone: { type: 'string', minLength: 1, maxLength: 64 },
		location: { type: 'string', nullable: true, maxLength: 256 },
		meetingUrl: { type: 'string', nullable: true, maxLength: 512 },
	},
	required: ['eventId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private eventService: EventService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const { eventId, ...updateData } = ps;
			return await this.eventService.update(me, eventId, updateData);
		});
	}
}
