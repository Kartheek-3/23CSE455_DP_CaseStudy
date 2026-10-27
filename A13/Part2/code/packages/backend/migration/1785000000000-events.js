/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class Events1785000000000 {
	name = 'Events1785000000000';

	async up(queryRunner) {
		await queryRunner.query(`
			CREATE TABLE "event" (
				"id" character varying(32) NOT NULL,
				"userId" character varying(32) NOT NULL,
				"title" character varying(128) NOT NULL,
				"description" character varying(2048),
				"startsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"endsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"timezone" character varying(64) NOT NULL,
				"location" character varying(256),
				"meetingUrl" character varying(512),
				"isCancelled" boolean NOT NULL DEFAULT false,
				"reminderSentAt" TIMESTAMP WITH TIME ZONE,
				"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				CONSTRAINT "PK_event_id" PRIMARY KEY ("id"),
				CONSTRAINT "FK_event_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
			)
		`);

		await queryRunner.query(`CREATE INDEX "IDX_event_userId" ON "event" ("userId")`);
		await queryRunner.query(`CREATE INDEX "IDX_event_startsAt" ON "event" ("startsAt")`);
		await queryRunner.query(`CREATE INDEX "IDX_event_isCancelled" ON "event" ("isCancelled")`);
		await queryRunner.query(`CREATE INDEX "IDX_event_createdAt" ON "event" ("createdAt")`);

		await queryRunner.query(`
			CREATE TABLE "event_rsvp" (
				"id" character varying(32) NOT NULL,
				"eventId" character varying(32) NOT NULL,
				"userId" character varying(32) NOT NULL,
				"status" character varying(32) NOT NULL,
				"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				CONSTRAINT "PK_event_rsvp_id" PRIMARY KEY ("id"),
				CONSTRAINT "UQ_event_rsvp_event_user" UNIQUE ("eventId", "userId"),
				CONSTRAINT "FK_event_rsvp_eventId" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
				CONSTRAINT "FK_event_rsvp_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
			)
		`);

		await queryRunner.query(`CREATE INDEX "IDX_event_rsvp_eventId" ON "event_rsvp" ("eventId")`);
		await queryRunner.query(`CREATE INDEX "IDX_event_rsvp_userId" ON "event_rsvp" ("userId")`);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP TABLE "event_rsvp"`);
		await queryRunner.query(`DROP TABLE "event"`);
	}
}
