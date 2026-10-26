/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { RecommendationService } from '@/core/RecommendationService.js';

export const meta = {
	tags: ['recommendations'],
	requireCredential: true,
	kind: 'read:account',
	res: {
		type: 'object',
		optional: false,
		nullable: false,
		properties: {
			mutedTopics: {
				type: 'array',
				items: { type: 'string' },
			},
			reducedAuthors: {
				type: 'array',
				items: { type: 'string' },
			},
			preferredTopics: {
				type: 'array',
				items: { type: 'string' },
			},
			topicWeights: {
				type: 'object',
			},
		},
		required: ['mutedTopics', 'reducedAuthors', 'preferredTopics'],
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private recommendationService: RecommendationService,
	) {
		super(meta, paramDef, async (_ps, me) => {
			const pref = await this.recommendationService.getPreferences(me.id);
			return {
				mutedTopics: pref.mutedTopics ?? [],
				reducedAuthors: pref.reducedAuthors ?? [],
				preferredTopics: pref.preferredTopics ?? [],
				topicWeights: pref.topicWeights ?? {},
			};
		});
	}
}
