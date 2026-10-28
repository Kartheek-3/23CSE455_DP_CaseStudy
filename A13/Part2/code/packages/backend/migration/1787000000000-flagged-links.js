/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class FlaggedLinks1787000000000 {
	name = 'FlaggedLinks1787000000000';

	async up(queryRunner) {
		await queryRunner.query(`
			CREATE TABLE "flagged_link" (
				"id" character varying(32) NOT NULL,
				"url" text NOT NULL,
				"canonicalUrl" character varying(1024) NOT NULL,
				"domain" character varying(255) NOT NULL,
				"riskCategory" character varying(32) NOT NULL,
				"reason" text NOT NULL,
				"threatType" character varying(64) NOT NULL DEFAULT 'spam',
				"source" character varying(64) NOT NULL DEFAULT 'reputation',
				"userId" character varying(32),
				"noteId" character varying(32),
				"resolved" boolean NOT NULL DEFAULT false,
				"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				CONSTRAINT "PK_flagged_link_id" PRIMARY KEY ("id"),
				CONSTRAINT "FK_flagged_link_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
				CONSTRAINT "FK_flagged_link_noteId" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE SET NULL ON UPDATE NO ACTION
			)
		`);

		await queryRunner.query(`CREATE INDEX "IDX_flagged_link_canonicalUrl" ON "flagged_link" ("canonicalUrl")`);
		await queryRunner.query(`CREATE INDEX "IDX_flagged_link_domain" ON "flagged_link" ("domain")`);
		await queryRunner.query(`CREATE INDEX "IDX_flagged_link_riskCategory" ON "flagged_link" ("riskCategory")`);
		await queryRunner.query(`CREATE INDEX "IDX_flagged_link_userId" ON "flagged_link" ("userId")`);
		await queryRunner.query(`CREATE INDEX "IDX_flagged_link_noteId" ON "flagged_link" ("noteId")`);
		await queryRunner.query(`CREATE INDEX "IDX_flagged_link_resolved" ON "flagged_link" ("resolved")`);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP TABLE "flagged_link"`);
	}
}
