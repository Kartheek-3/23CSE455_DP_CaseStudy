/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class RecommendationPreferences1788000000000 {
	name = 'RecommendationPreferences1788000000000';

	async up(queryRunner) {
		await queryRunner.query(`
			CREATE TABLE "recommendation_preference" (
				"userId" character varying(32) NOT NULL,
				"mutedTopics" character varying(128)[] NOT NULL DEFAULT '{}',
				"reducedAuthors" character varying(32)[] NOT NULL DEFAULT '{}',
				"preferredTopics" character varying(128)[] NOT NULL DEFAULT '{}',
				"topicWeights" jsonb NOT NULL DEFAULT '{}',
				"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				CONSTRAINT "PK_recommendation_preference_userId" PRIMARY KEY ("userId"),
				CONSTRAINT "FK_recommendation_preference_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
			)
		`);

		await queryRunner.query(`CREATE INDEX "IDX_recommendation_preference_userId" ON "recommendation_preference" ("userId")`);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP TABLE "recommendation_preference"`);
	}
}
