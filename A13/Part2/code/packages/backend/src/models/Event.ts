/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';

@Entity('event')
export class MiEvent {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column({
		...id(),
		comment: 'The creator user ID.',
	})
	public userId: MiUser['id'];

	@ManyToOne(() => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser;

	@Column('varchar', {
		length: 128,
		comment: 'The title of the Event.',
	})
	public title: string;

	@Column('varchar', {
		length: 2048,
		nullable: true,
		comment: 'The description of the Event.',
	})
	public description: string | null;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The start date and time of the Event in UTC.',
	})
	public startsAt: Date;

	@Column('timestamp with time zone', {
		comment: 'The end date and time of the Event in UTC.',
	})
	public endsAt: Date;

	@Column('varchar', {
		length: 64,
		comment: 'The IANA timezone identifier (e.g. UTC, Asia/Tokyo).',
	})
	public timezone: string;

	@Column('varchar', {
		length: 256,
		nullable: true,
		comment: 'Physical location of the Event.',
	})
	public location: string | null;

	@Column('varchar', {
		length: 512,
		nullable: true,
		comment: 'Online meeting URL for the Event.',
	})
	public meetingUrl: string | null;

	@Index()
	@Column('boolean', {
		default: false,
		comment: 'Whether the event has been cancelled by the creator.',
	})
	public isCancelled: boolean;

	@Column('timestamp with time zone', {
		nullable: true,
		comment: 'Timestamp when the 15-minute lead reminder was dispatched.',
	})
	public reminderSentAt: Date | null;

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
