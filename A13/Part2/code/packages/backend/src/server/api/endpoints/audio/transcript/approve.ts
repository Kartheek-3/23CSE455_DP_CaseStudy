/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { AudioTranscriptService, AUDIO_TRANSCRIPT_ERRORS } from '@/core/AudioTranscriptService.js';

export const meta = {
	tags: ['audio'],
	requireCredential: true,
	kind: 'write:drive',
	limit: {
		duration: ms('1hour'),
		max: 60,
	},
	res: {
		type: 'object',
		optional: false,
		nullable: false,
	},
	errors: AUDIO_TRANSCRIPT_ERRORS,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		fileId: { type: 'string', format: 'misskey:id' },
	},
	required: ['fileId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private audioTranscriptService: AudioTranscriptService,
	) {
		super(meta, paramDef, async (ps, me) => {
			return await this.audioTranscriptService.approveTranscript(ps.fileId, me);
		});
	}
}
