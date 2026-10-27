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
		type: 'object',
		optional: true,
		nullable: true,
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
			return await this.audioTranscriptService.getTranscript(ps.fileId, me);
		});
	}
}
