/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { AudioTranscriptService, AUDIO_TRANSCRIPT_ERRORS } from '@/core/AudioTranscriptService.js';

export const meta = {
	tags: ['audio'],
	requireCredential: false,
	res: {
		type: 'array',
		optional: false,
		nullable: false,
		items: {
			type: 'object',
			optional: false,
			nullable: false,
		},
	},
	errors: AUDIO_TRANSCRIPT_ERRORS,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		query: { type: 'string', minLength: 1 },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
	},
	required: ['query'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private audioTranscriptService: AudioTranscriptService,
	) {
		super(meta, paramDef, async (ps, me) => {
			return await this.audioTranscriptService.search(ps.query, me, ps.limit);
		});
	}
}
