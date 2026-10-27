/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, beforeEach, test, expect, vi } from 'vitest';
import {
	AudioTranscriptService,
	AudioTranscriptStateMachine,
	AUDIO_TRANSCRIPT_ERRORS,
} from '@/core/AudioTranscriptService.js';
import type { AudioTranscriptsRepository, DriveFilesRepository, NotesRepository } from '@/models/_.js';
import type { MiAudioTranscript } from '@/models/AudioTranscript.js';
import type { MiDriveFile } from '@/models/DriveFile.js';
import type { MiUser } from '@/models/User.js';
import type { MiNote } from '@/models/Note.js';
import type { IdService } from '@/core/IdService.js';
import {
	MockTranscriptionProvider,
	DisabledTranscriptionProvider,
	type AudioFileContext,
} from '@/core/audio/AudioTranscriptionProvider.js';
import { ApiError } from '@/server/api/error.js';

describe('AudioTranscriptService', () => {
	let audioTranscriptService: AudioTranscriptService;

	let transcriptsStore: Map<string, MiAudioTranscript>;
	let driveFilesStore: Map<string, MiDriveFile>;
	let notesStore: Map<string, MiNote>;

	let audioTranscriptsRepoMock: Partial<AudioTranscriptsRepository>;
	let driveFilesRepoMock: Partial<DriveFilesRepository>;
	let notesRepoMock: Partial<NotesRepository>;
	let idServiceMock: Partial<IdService>;

	let currentIdCounter = 1;

	const authorUser: MiUser = {
		id: 'author_01',
		username: 'alice',
		host: null,
	} as unknown as MiUser;

	const otherUser: MiUser = {
		id: 'user_02',
		username: 'bob',
		host: null,
	} as unknown as MiUser;

	const validAudioFile: MiDriveFile = {
		id: 'audio_file_01',
		userId: authorUser.id,
		user: authorUser,
		name: 'interview.mp3',
		type: 'audio/mpeg',
		size: 2048576,
		url: 'https://example.com/files/interview.mp3',
	} as unknown as MiDriveFile;

	const nonAudioFile: MiDriveFile = {
		id: 'image_file_01',
		userId: authorUser.id,
		user: authorUser,
		name: 'photo.jpg',
		type: 'image/jpeg',
		size: 1048576,
		url: 'https://example.com/files/photo.jpg',
	} as unknown as MiDriveFile;

	beforeEach(() => {
		transcriptsStore = new Map();
		driveFilesStore = new Map();
		notesStore = new Map();
		currentIdCounter = 1;

		driveFilesStore.set(validAudioFile.id, { ...validAudioFile });
		driveFilesStore.set(nonAudioFile.id, { ...nonAudioFile });

		idServiceMock = {
			gen: vi.fn(() => `tr_id_${currentIdCounter++}`),
		};

		audioTranscriptsRepoMock = {
			insertOne: vi.fn(async (entity: MiAudioTranscript) => {
				transcriptsStore.set(entity.fileId, { ...entity });
				return entity;
			}),
			findOneBy: vi.fn(async (query: { fileId?: string; id?: string }) => {
				if (query.fileId) {
					const t = transcriptsStore.get(query.fileId);
					return t ? { ...t } : null;
				}
				if (query.id) {
					for (const t of transcriptsStore.values()) {
						if (t.id === query.id) return { ...t };
					}
				}
				return null;
			}),
			save: vi.fn(async (entity: MiAudioTranscript) => {
				transcriptsStore.set(entity.fileId, { ...entity });
				return entity;
			}),
			find: vi.fn(async (opts?: any) => {
				const all = Array.from(transcriptsStore.values());
				if (opts?.where?.status) {
					return all.filter(t => t.status === opts.where.status).map(t => ({ ...t }));
				}
				return all.map(t => ({ ...t }));
			}),
		};

		driveFilesRepoMock = {
			findOneBy: vi.fn(async (query: { id: string }) => {
				const f = driveFilesStore.get(query.id);
				return f ? { ...f } : null;
			}),
		};

		notesRepoMock = {
			findOneBy: vi.fn(async (query: { id: string }) => {
				const n = notesStore.get(query.id);
				return n ? { ...n } : null;
			}),
		};

		audioTranscriptService = new AudioTranscriptService(
			audioTranscriptsRepoMock as AudioTranscriptsRepository,
			driveFilesRepoMock as DriveFilesRepository,
			notesRepoMock as NotesRepository,
			idServiceMock as IdService,
			new MockTranscriptionProvider(),
		);
	});

	// --- 1. Audio Handling ---
	test('1. Valid audio asset is accepted for transcription workflow', async () => {
		const transcript = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		expect(transcript).toBeDefined();
		expect(transcript.fileId).toBe(validAudioFile.id);
		expect(transcript.userId).toBe(authorUser.id);
	});

	test('2. Invalid or non-audio MIME type is rejected with INVALID_FILE_TYPE', async () => {
		await expect(
			audioTranscriptService.requestTranscription(nonAudioFile.id, authorUser),
		).rejects.toThrow(expect.objectContaining({ code: AUDIO_TRANSCRIPT_ERRORS.INVALID_FILE_TYPE.code }));
	});

	test('3. Non-existent file ID is rejected with NO_SUCH_FILE', async () => {
		await expect(
			audioTranscriptService.requestTranscription('non_existent_file', authorUser),
		).rejects.toThrow(expect.objectContaining({ code: AUDIO_TRANSCRIPT_ERRORS.NO_SUCH_FILE.code }));
	});

	test('4. Non-owner cannot request transcription for another user file', async () => {
		await expect(
			audioTranscriptService.requestTranscription(validAudioFile.id, otherUser),
		).rejects.toThrow(expect.objectContaining({ code: AUDIO_TRANSCRIPT_ERRORS.PERMISSION_DENIED.code }));
	});

	// --- 2. Transcription Workflow & Provider Abstraction ---
	test('5. Configured provider returns valid draft transcript', async () => {
		const customProvider = new MockTranscriptionProvider((file: AudioFileContext) => `Custom transcript for ${file.name}`);
		audioTranscriptService.setProvider(customProvider);

		const transcript = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		expect(transcript.status).toBe('draft');
		expect(transcript.text).toBe(`Custom transcript for ${validAudioFile.name}`);
		expect(transcript.provider).toBe('mock');
	});

	test('6. Disabled or missing provider configuration sets status to failed without crashing', async () => {
		audioTranscriptService.setProvider(new DisabledTranscriptionProvider());

		const transcript = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		expect(transcript.status).toBe('failed');
		expect(transcript.errorMessage).toContain('disabled');
	});

	test('7. Provider execution failure accurately produces failed status', async () => {
		const failingProvider = {
			name: 'flaky-service',
			transcribe: vi.fn().mockRejectedValue(new Error('Audio decoding timeout after 30s')),
		};
		audioTranscriptService.setProvider(failingProvider);

		const transcript = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		expect(transcript.status).toBe('failed');
		expect(transcript.errorMessage).toBe('Audio decoding timeout after 30s');
	});

	test('8. Repeated requests do not create duplicate jobs or records (idempotent)', async () => {
		const transcript1 = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		const transcript2 = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);

		expect(transcript1.id).toBe(transcript2.id);
		expect(transcriptsStore.size).toBe(1);
	});

	test('9. Transcription result is stored as draft rather than immediately published', async () => {
		const transcript = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		expect(transcript.status).toBe('draft');
		expect(transcript.status).not.toBe('approved');
	});

	// --- 3. Review, Correction and Approval ---
	test('10. Author can view draft transcript', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		const draft = await audioTranscriptService.getTranscript(validAudioFile.id, authorUser);

		expect(draft).not.toBeNull();
		expect(draft?.status).toBe('draft');
		expect(draft?.text).toBeDefined();
	});

	test('11. Author can edit and correct draft transcript text', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		const updated = await audioTranscriptService.updateDraft(validAudioFile.id, authorUser, 'Corrected speech-to-text words.');

		expect(updated.text).toBe('Corrected speech-to-text words.');
		const stored = await audioTranscriptService.getTranscript(validAudioFile.id, authorUser);
		expect(stored?.text).toBe('Corrected speech-to-text words.');
	});

	test('12. Author can approve draft and transition status to approved', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		const approved = await audioTranscriptService.approveTranscript(validAudioFile.id, authorUser);

		expect(approved.status).toBe('approved');
	});

	test('13. Non-author cannot view unapproved draft transcript', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);

		await expect(
			audioTranscriptService.getTranscript(validAudioFile.id, otherUser),
		).rejects.toThrow(expect.objectContaining({ code: AUDIO_TRANSCRIPT_ERRORS.PERMISSION_DENIED.code }));
	});

	test('14. Non-author cannot edit or approve another author draft transcript', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);

		await expect(
			audioTranscriptService.updateDraft(validAudioFile.id, otherUser, 'Hacked text'),
		).rejects.toThrow(expect.objectContaining({ code: AUDIO_TRANSCRIPT_ERRORS.PERMISSION_DENIED.code }));

		await expect(
			audioTranscriptService.approveTranscript(validAudioFile.id, otherUser),
		).rejects.toThrow(expect.objectContaining({ code: AUDIO_TRANSCRIPT_ERRORS.PERMISSION_DENIED.code }));
	});

	test('15. Author can reject / discard a draft transcript', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		await audioTranscriptService.rejectTranscript(validAudioFile.id, authorUser);

		const draft = await audioTranscriptService.getTranscript(validAudioFile.id, authorUser);
		expect(draft?.status).toBe('failed');
		expect(draft?.errorMessage).toBe('Discarded by author');
	});

	// --- 4. Publication, Search & Visibility ---
	test('16. Approved transcripts are visible to public / third-party users', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		await audioTranscriptService.approveTranscript(validAudioFile.id, authorUser);

		const fetched = await audioTranscriptService.getTranscript(validAudioFile.id, otherUser);
		expect(fetched).not.toBeNull();
		expect(fetched?.status).toBe('approved');
	});

	test('17. Unapproved draft transcripts are strictly excluded from search results', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);

		const results = await audioTranscriptService.search('interview', null);
		expect(results.length).toBe(0);
	});

	test('18. Search returns approved transcripts matching query string', async () => {
		await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		await audioTranscriptService.updateDraft(validAudioFile.id, authorUser, 'Discussion about distributed architecture and Misskey.');
		await audioTranscriptService.approveTranscript(validAudioFile.id, authorUser);

		const matches = await audioTranscriptService.search('distributed architecture', null);
		expect(matches.length).toBe(1);
		expect(matches[0].text).toContain('distributed architecture');
	});

	test('19. Search respects note visibility restrictions (private / specified visibility)', async () => {
		const privateNote: MiNote = {
			id: 'note_private_01',
			userId: authorUser.id,
			visibility: 'specified',
			visibleUserIds: ['trusted_friend_03'],
		} as unknown as MiNote;
		notesStore.set(privateNote.id, privateNote);

		const privateAudioFile: MiDriveFile = {
			id: 'private_audio_file',
			userId: authorUser.id,
			type: 'audio/wav',
			name: 'confidential.wav',
			url: 'https://example.com/files/confidential.wav',
		} as unknown as MiDriveFile;
		driveFilesStore.set(privateAudioFile.id, privateAudioFile);

		await audioTranscriptService.requestTranscription(privateAudioFile.id, authorUser, privateNote.id);
		await audioTranscriptService.updateDraft(privateAudioFile.id, authorUser, 'Confidential corporate strategy discussion');
		await audioTranscriptService.approveTranscript(privateAudioFile.id, authorUser);

		// Unrelated user cannot see confidential transcript in search
		const searchBob = await audioTranscriptService.search('Confidential corporate strategy', otherUser);
		expect(searchBob.length).toBe(0);

		// Note author CAN see it in search
		const searchAuthor = await audioTranscriptService.search('Confidential corporate strategy', authorUser);
		expect(searchAuthor.length).toBe(1);
	});

	// --- 5. State Machine Invariants & Retries ---
	test('20. AudioTranscriptStateMachine rejects illegal transitions', () => {
		// Cannot jump from queued directly to approved
		expect(AudioTranscriptStateMachine.canTransition('queued', 'approved')).toBe(false);
		expect(() => AudioTranscriptStateMachine.assertTransition('queued', 'approved')).toThrow();

		// Cannot approve a failed job without re-queueing/processing
		expect(AudioTranscriptStateMachine.canTransition('failed', 'approved')).toBe(false);
		expect(() => AudioTranscriptStateMachine.assertTransition('failed', 'approved')).toThrow();

		// Can transition queued -> processing, processing -> draft, draft -> approved
		expect(AudioTranscriptStateMachine.canTransition('queued', 'processing')).toBe(true);
		expect(AudioTranscriptStateMachine.canTransition('processing', 'draft')).toBe(true);
		expect(AudioTranscriptStateMachine.canTransition('draft', 'approved')).toBe(true);
	});

	test('21. Retrying failed transcription transitions back to queued and succeeds', async () => {
		// First attempt fails with disabled provider
		audioTranscriptService.setProvider(new DisabledTranscriptionProvider());
		const failed = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		expect(failed.status).toBe('failed');

		// Provider re-enabled -> retry request succeeds
		audioTranscriptService.setProvider(new MockTranscriptionProvider());
		const retried = await audioTranscriptService.requestTranscription(validAudioFile.id, authorUser);
		expect(retried.status).toBe('draft');
		expect(retried.errorMessage).toBeNull();
	});
});
