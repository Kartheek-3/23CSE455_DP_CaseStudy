/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiDriveFile } from './DriveFile.js';
import { MiNote } from './Note.js';

export const audioTranscriptStatuses = ['queued', 'processing', 'draft', 'approved', 'failed'] as const;
export type AudioTranscriptStatus = typeof audioTranscriptStatuses[number];

@Entity('audio_transcript')
export class MiAudioTranscript {
	@PrimaryColumn(id())
	public id: string;

	@Index({ unique: true })
	@Column({
		...id(),
		comment: 'The ID of the associated DriveFile audio clip.',
	})
	public fileId: MiDriveFile['id'];

	@ManyToOne(() => MiDriveFile, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public file: MiDriveFile;

	@Index()
	@Column({
		...id(),
		comment: 'The owner / author ID.',
	})
	public userId: MiUser['id'];

	@ManyToOne(() => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'Optional associated Note ID.',
	})
	public noteId: MiNote['id'] | null;

	@ManyToOne(() => MiNote, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	public note: MiNote | null;

	@Column('text', {
		default: '',
		comment: 'The transcribed text content.',
	})
	public text: string;

	@Index()
	@Column('varchar', {
		length: 32,
		default: 'queued',
		comment: 'The transcript lifecycle status (queued, processing, draft, approved, failed).',
	})
	public status: AudioTranscriptStatus;

	@Column('varchar', {
		length: 64,
		default: 'local-whisper',
		comment: 'The transcription provider identifier.',
	})
	public provider: string;

	@Column('text', {
		nullable: true,
		comment: 'Error message if transcription failed.',
	})
	public errorMessage: string | null;

	@Column('timestamp with time zone', {
		comment: 'The created date.',
	})
	public createdAt: Date;

	@Column('timestamp with time zone', {
		comment: 'The updated date.',
	})
	public updatedAt: Date;
}
