/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, OneToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';

@Entity('recommendation_preference')
export class MiRecommendationPreference {
	@PrimaryColumn(id())
	public userId: MiUser['id'];

	@OneToOne(() => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser;

	@Column('varchar', {
		length: 128,
		array: true,
		default: '{}',
		comment: 'Explicitly muted topics / hashtags excluded from recommendations.',
	})
	public mutedTopics: string[];

	@Column('varchar', {
		length: 32,
		array: true,
		default: '{}',
		comment: 'Author user IDs whose recommendations should be heavily suppressed.',
	})
	public reducedAuthors: string[];

	@Column('varchar', {
		length: 128,
		array: true,
		default: '{}',
		comment: 'Explicit user-selected topics of interest.',
	})
	public preferredTopics: string[];

	@Column('jsonb', {
		default: {},
		comment: 'Inferred topic weights derived from interactions.',
	})
	public topicWeights: Record<string, number>;

	@Column('timestamp with time zone', {
		comment: 'The created date.',
	})
	public createdAt: Date;

	@Column('timestamp with time zone', {
		comment: 'The updated date.',
	})
	public updatedAt: Date;
}
