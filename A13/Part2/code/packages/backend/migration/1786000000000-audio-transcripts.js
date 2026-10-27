/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AudioTranscripts1786000000000 {
	name = 'AudioTranscripts1786000000000';

	async up(queryRunner) {
		await queryRunner.query(`
			CREATE TABLE "audio_transcript" (
				"id" character varying(32) NOT NULL,
				"fileId" character varying(32) NOT NULL,
				"userId" character varying(32) NOT NULL,
				"noteId" character varying(32),
				"text" text NOT NULL DEFAULT '',
				"status" character varying(32) NOT NULL DEFAULT 'queued',
				"provider" character varying(64) NOT NULL DEFAULT 'local-whisper',
				"errorMessage" text,
				"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				CONSTRAINT "PK_audio_transcript_id" PRIMARY KEY ("id"),
				CONSTRAINT "UQ_audio_transcript_fileId" UNIQUE ("fileId"),
				CONSTRAINT "FK_audio_transcript_fileId" FOREIGN KEY ("fileId") REFERENCES "drive_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
				CONSTRAINT "FK_audio_transcript_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
				CONSTRAINT "FK_audio_transcript_noteId" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE SET NULL ON UPDATE NO ACTION
			)
		`);

		await queryRunner.query(`CREATE INDEX "IDX_audio_transcript_fileId" ON "audio_transcript" ("fileId")`);
		await queryRunner.query(`CREATE INDEX "IDX_audio_transcript_userId" ON "audio_transcript" ("userId")`);
		await queryRunner.query(`CREATE INDEX "IDX_audio_transcript_noteId" ON "audio_transcript" ("noteId")`);
		await queryRunner.query(`CREATE INDEX "IDX_audio_transcript_status" ON "audio_transcript" ("status")`);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP TABLE "audio_transcript"`);
	}
}
