/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { RecommendationService } from '@/core/RecommendationService.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';

export const meta = {
	tags: ['recommendations', 'notes'],
	requireCredential: true,
	kind: 'read:account',
	res: {
		type: 'array',
		optional: false,
		nullable: false,
		items: {
			type: 'object',
			optional: false,
			nullable: false,
			ref: 'Note',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		mode: { type: 'string', enum: ['personalized', 'chronological'], default: 'personalized' },
		sinceId: { type: 'string', format: 'misskey:id', nullable: true },
		untilId: { type: 'string', format: 'misskey:id', nullable: true },
	},
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private recommendationService: RecommendationService,
		private noteEntityService: NoteEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const recommendations = await this.recommendationService.getRecommendations(me.id, {
				limit: ps.limit,
				mode: ps.mode as 'personalized' | 'chronological',
				sinceId: ps.sinceId ?? undefined,
				untilId: ps.untilId ?? undefined,
			});

			if (recommendations.length === 0) {
				return [];
			}

			const notes = recommendations.map(r => r.note);
			const packedNotes = await this.noteEntityService.packMany(notes, me);

			const recMap = new Map(recommendations.map(r => [r.note.id, r]));

			for (const packed of packedNotes) {
				const rec = recMap.get(packed.id);
				if (rec) {
					(packed as any).recommendationReason = rec.explanation;
					(packed as any).recommendationScore = rec.score;
					(packed as any).principalReason = rec.principalReason;
				}
			}

			return packedNotes;
		});
	}
}
