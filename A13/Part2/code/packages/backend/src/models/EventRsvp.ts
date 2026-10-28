/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiEvent } from './Event.js';

export type EventRsvpStatus = 'going' | 'interested' | 'not_going';

@Entity('event_rsvp')
@Index(['eventId', 'userId'], { unique: true })
export class MiEventRsvp {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column({
		...id(),
		comment: 'The target Event ID.',
	})
	public eventId: MiEvent['id'];

	@ManyToOne(() => MiEvent, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public event: MiEvent;

	@Index()
	@Column({
		...id(),
		comment: 'The user ID who submitted the RSVP.',
	})
	public userId: MiUser['id'];

	@ManyToOne(() => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser;

	@Column('varchar', {
		length: 32,
		comment: 'The RSVP attendance intention (going, interested, not_going).',
	})
	public status: EventRsvpStatus;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The creation timestamp.',
	})
	public createdAt: Date;

	@Column('timestamp with time zone', {
		comment: 'The update timestamp.',
	})
	public updatedAt: Date;
}
