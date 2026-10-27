/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiNote } from './Note.js';

export const linkRiskCategories = ['malicious', 'suspicious'] as const;
export type LinkRiskCategory = typeof linkRiskCategories[number];

export const linkThreatTypes = [
	'phishing',
	'malware',
	'spam',
	'shortener',
	'homograph',
	'userinfo_obfuscation',
	'ip_direct',
	'reputation_blocklist',
] as const;
export type LinkThreatType = typeof linkThreatTypes[number];

export const linkFlagSources = [
	'reputation',
	'homograph',
	'userinfo',
	'spam_frequency',
	'report',
	'admin_manual',
] as const;
export type LinkFlagSource = typeof linkFlagSources[number];

@Entity('flagged_link')
export class MiFlaggedLink {
	@PrimaryColumn(id())
	public id: string;

	@Column('text', {
		comment: 'Original raw URL submitted or detected.',
	})
	public url: string;

	@Index()
	@Column('varchar', {
		length: 1024,
		comment: 'Normalized canonical URL used for deduplication.',
	})
	public canonicalUrl: string;

	@Index()
	@Column('varchar', {
		length: 255,
		comment: 'Parsed destination domain / hostname.',
	})
	public domain: string;

	@Index()
	@Column('varchar', {
		length: 32,
		comment: 'Assessed risk category (malicious or suspicious).',
	})
	public riskCategory: LinkRiskCategory;

	@Column('text', {
		comment: 'Human-readable advisory reason.',
	})
	public reason: string;

	@Column('varchar', {
		length: 64,
		default: 'spam',
		comment: 'Identified threat or suspicion type.',
	})
	public threatType: LinkThreatType;

	@Column('varchar', {
		length: 64,
		default: 'reputation',
		comment: 'Source signal or analysis mechanism responsible for the flag.',
	})
	public source: LinkFlagSource;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'User who posted or submitted the flagged link, if known.',
	})
	public userId: MiUser['id'] | null;

	@ManyToOne(() => MiUser, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	public user: MiUser | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'Associated Note ID, if link was in a note.',
	})
	public noteId: MiNote['id'] | null;

	@ManyToOne(() => MiNote, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	public note: MiNote | null;

	@Index()
	@Column('boolean', {
		default: false,
		comment: 'Whether an administrator or moderator resolved/reviewed this record.',
	})
	public resolved: boolean;

	@Column('timestamp with time zone', {
		comment: 'The created date.',
	})
	public createdAt: Date;

	@Column('timestamp with time zone', {
		comment: 'The updated date.',
	})
	public updatedAt: Date;
}
