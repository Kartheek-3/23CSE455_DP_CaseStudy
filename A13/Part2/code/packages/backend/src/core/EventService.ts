/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable, Optional } from '@nestjs/common';
import { In } from 'typeorm';
import { DI } from '@/di-symbols.js';
import type { EventsRepository, EventRsvpsRepository, UsersRepository } from '@/models/_.js';
import { MiEvent } from '@/models/Event.js';
import { MiEventRsvp, EventRsvpStatus } from '@/models/EventRsvp.js';
import { IdService } from '@/core/IdService.js';
import { NotificationService } from '@/core/NotificationService.js';
import { QueueService } from '@/core/QueueService.js';
import { ApiError } from '@/server/api/error.js';
import { bindThis } from '@/decorators.js';

export const EVENT_ERRORS = {
	noSuchEvent: {
		message: 'No such event.',
		code: 'NO_SUCH_EVENT',
		id: '2707f1ec-6ceb-478a-9289-49cfadfe04a1',
	},
	accessDenied: {
		message: 'Access denied.',
		code: 'ACCESS_DENIED',
		id: '2707f1ec-6ceb-478a-9289-49cfadfe04a2',
	},
	eventCancelled: {
		message: 'Event has been cancelled.',
		code: 'EVENT_CANCELLED',
		id: '2707f1ec-6ceb-478a-9289-49cfadfe04a3',
	},
	eventEnded: {
		message: 'Event has already ended.',
		code: 'EVENT_ENDED',
		id: '2707f1ec-6ceb-478a-9289-49cfadfe04a4',
	},
	invalidTimeRange: {
		message: 'Start time must be before end time.',
		code: 'INVALID_TIME_RANGE',
		id: '2707f1ec-6ceb-478a-9289-49cfadfe04a5',
	},
	invalidTimezone: {
		message: 'Invalid IANA timezone identifier.',
		code: 'INVALID_TIMEZONE',
		id: '2707f1ec-6ceb-478a-9289-49cfadfe04a6',
	},
	invalidMeetingUrl: {
		message: 'Meeting URL must use http or https scheme.',
		code: 'INVALID_MEETING_URL',
		id: '2707f1ec-6ceb-478a-9289-49cfadfe04a7',
	},
	invalidTitle: {
		message: 'Title must be between 1 and 128 characters.',
		code: 'INVALID_TITLE',
		id: '2707f1ec-6ceb-478a-9289-49cfadfe04a8',
	},
};

export type CreateEventArgs = {
	title: string;
	description?: string | null;
	startsAt: string | Date;
	endsAt: string | Date;
	timezone: string;
	location?: string | null;
	meetingUrl?: string | null;
};

export type UpdateEventArgs = {
	title?: string;
	description?: string | null;
	startsAt?: string | Date;
	endsAt?: string | Date;
	timezone?: string;
	location?: string | null;
	meetingUrl?: string | null;
};

export type EventAttendanceSummary = {
	going: number;
	interested: number;
	notGoing: number;
};

export type EventDetail = {
	event: MiEvent;
	attendance: EventAttendanceSummary;
	myRsvp?: EventRsvpStatus | null;
};

/**
 * Value Object encapsulating reminder scheduling calculations
 * to address Primitive Obsession around date/time comparisons.
 */
export class EventReminderSchedule {
	public static readonly DEFAULT_LEAD_TIME_MS = 15 * 60 * 1000; // 15 minutes

	public readonly reminderAt: Date;
	public readonly delayMs: number;
	public readonly isEligible: boolean;

	constructor(startsAt: Date, now: Date = new Date(), leadTimeMs: number = EventReminderSchedule.DEFAULT_LEAD_TIME_MS) {
		const targetTime = startsAt.getTime() - leadTimeMs;
		this.reminderAt = new Date(targetTime);
		this.delayMs = targetTime - now.getTime();
		// Eligible only if the reminder moment is in the future
		this.isEligible = this.delayMs > 0;
	}
}

@Injectable()
export class EventService {
	constructor(
		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		@Inject(DI.eventRsvpsRepository)
		private eventRsvpsRepository: EventRsvpsRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		private idService: IdService,

		private notificationService: NotificationService,

		@Optional()
		private queueService?: QueueService,
	) {}

	public isValidTimezone(tz: string): boolean {
		if (!tz || typeof tz !== 'string') return false;
		try {
			Intl.DateTimeFormat(undefined, { timeZone: tz });
			return true;
		} catch {
			return false;
		}
	}

	public isValidMeetingUrl(url: string | null | undefined): boolean {
		if (!url) return true;
		try {
			const parsed = new URL(url);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch {
			return false;
		}
	}

	@bindThis
	public async create(user: { id: string }, data: CreateEventArgs): Promise<MiEvent> {
		const title = data.title?.trim();
		if (!title || title.length > 128) {
			throw new ApiError(EVENT_ERRORS.invalidTitle);
		}

		if (!this.isValidTimezone(data.timezone)) {
			throw new ApiError(EVENT_ERRORS.invalidTimezone);
		}

		if (data.meetingUrl && !this.isValidMeetingUrl(data.meetingUrl)) {
			throw new ApiError(EVENT_ERRORS.invalidMeetingUrl);
		}

		const startsAt = new Date(data.startsAt);
		const endsAt = new Date(data.endsAt);
		if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime()) || startsAt.getTime() >= endsAt.getTime()) {
			throw new ApiError(EVENT_ERRORS.invalidTimeRange);
		}

		const now = new Date();
		const eventId = this.idService.gen();

		const event = await this.eventsRepository.insertOne({
			id: eventId,
			userId: user.id,
			title,
			description: data.description ? data.description.trim() : null,
			startsAt,
			endsAt,
			timezone: data.timezone,
			location: data.location ? data.location.trim() : null,
			meetingUrl: data.meetingUrl ? data.meetingUrl.trim() : null,
			isCancelled: false,
			reminderSentAt: null,
			createdAt: now,
			updatedAt: now,
		} as MiEvent);

		// Automatically register the creator as 'going'
		const rsvpId = this.idService.gen();
		await this.eventRsvpsRepository.insertOne({
			id: rsvpId,
			eventId,
			userId: user.id,
			status: 'going',
			createdAt: now,
			updatedAt: now,
		} as MiEventRsvp);

		return event;
	}

	@bindThis
	public async update(user: { id: string }, eventId: string, data: UpdateEventArgs): Promise<MiEvent> {
		const event = await this.eventsRepository.findOneBy({ id: eventId });
		if (!event) {
			throw new ApiError(EVENT_ERRORS.noSuchEvent);
		}

		if (event.userId !== user.id) {
			throw new ApiError(EVENT_ERRORS.accessDenied);
		}

		if (event.isCancelled) {
			throw new ApiError(EVENT_ERRORS.eventCancelled);
		}

		if (data.title !== undefined) {
			const title = data.title.trim();
			if (!title || title.length > 128) {
				throw new ApiError(EVENT_ERRORS.invalidTitle);
			}
			event.title = title;
		}

		if (data.timezone !== undefined) {
			if (!this.isValidTimezone(data.timezone)) {
				throw new ApiError(EVENT_ERRORS.invalidTimezone);
			}
			event.timezone = data.timezone;
		}

		if (data.meetingUrl !== undefined) {
			if (data.meetingUrl && !this.isValidMeetingUrl(data.meetingUrl)) {
				throw new ApiError(EVENT_ERRORS.invalidMeetingUrl);
			}
			event.meetingUrl = data.meetingUrl ? data.meetingUrl.trim() : null;
		}

		if (data.location !== undefined) {
			event.location = data.location ? data.location.trim() : null;
		}

		if (data.description !== undefined) {
			event.description = data.description ? data.description.trim() : null;
		}

		let startOrEndTimeChanged = false;
		const startsAt = data.startsAt ? new Date(data.startsAt) : event.startsAt;
		const endsAt = data.endsAt ? new Date(data.endsAt) : event.endsAt;

		if (data.startsAt !== undefined || data.endsAt !== undefined) {
			if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime()) || startsAt.getTime() >= endsAt.getTime()) {
				throw new ApiError(EVENT_ERRORS.invalidTimeRange);
			}
			if (startsAt.getTime() !== event.startsAt.getTime() || endsAt.getTime() !== event.endsAt.getTime()) {
				startOrEndTimeChanged = true;
			}
			event.startsAt = startsAt;
			event.endsAt = endsAt;
		}

		// Reset reminder if start time changed into the future
		if (startOrEndTimeChanged) {
			const reminderSchedule = new EventReminderSchedule(event.startsAt);
			if (reminderSchedule.isEligible) {
				event.reminderSentAt = null;
			}
		}

		event.updatedAt = new Date();
		await this.eventsRepository.save(event);

		// Notify attendees about the event update
		const attendees = await this.eventRsvpsRepository.find({
			where: {
				eventId: event.id,
				status: In(['going', 'interested']),
			},
		});

		for (const attendee of attendees) {
			if (attendee.userId !== user.id) {
				await this.notificationService.createNotification(
					attendee.userId,
					user.id,
					'eventUpdated',
					{ eventId: event.id },
				);
			}
		}

		return event;
	}

	@bindThis
	public async cancel(user: { id: string }, eventId: string): Promise<MiEvent> {
		const event = await this.eventsRepository.findOneBy({ id: eventId });
		if (!event) {
			throw new ApiError(EVENT_ERRORS.noSuchEvent);
		}

		if (event.userId !== user.id) {
			throw new ApiError(EVENT_ERRORS.accessDenied);
		}

		if (event.isCancelled) {
			return event; // Idempotent cancellation
		}

		event.isCancelled = true;
		event.updatedAt = new Date();
		await this.eventsRepository.save(event);

		// Notify attendees of cancellation
		const attendees = await this.eventRsvpsRepository.find({
			where: {
				eventId: event.id,
				status: In(['going', 'interested']),
			},
		});

		for (const attendee of attendees) {
			if (attendee.userId !== user.id) {
				await this.notificationService.createNotification(
					attendee.userId,
					user.id,
					'eventCancelled',
					{ eventId: event.id },
				);
			}
		}

		return event;
	}

	@bindThis
	public async rsvp(user: { id: string }, eventId: string, status: EventRsvpStatus): Promise<MiEventRsvp> {
		const event = await this.eventsRepository.findOneBy({ id: eventId });
		if (!event) {
			throw new ApiError(EVENT_ERRORS.noSuchEvent);
		}

		if (event.isCancelled) {
			throw new ApiError(EVENT_ERRORS.eventCancelled);
		}

		if (event.endsAt.getTime() <= Date.now()) {
			throw new ApiError(EVENT_ERRORS.eventEnded);
		}

		const existing = await this.eventRsvpsRepository.findOneBy({
			eventId: event.id,
			userId: user.id,
		});

		const now = new Date();
		let rsvp: MiEventRsvp;
		const previousStatus = existing?.status;

		if (existing) {
			existing.status = status;
			existing.updatedAt = now;
			await this.eventRsvpsRepository.save(existing);
			rsvp = existing;
		} else {
			rsvp = await this.eventRsvpsRepository.insertOne({
				id: this.idService.gen(),
				eventId: event.id,
				userId: user.id,
				status,
				createdAt: now,
				updatedAt: now,
			} as MiEventRsvp);
		}

		// Notify creator if status actually changed and respondent is not the creator
		if (previousStatus !== status && user.id !== event.userId) {
			await this.notificationService.createNotification(
				event.userId,
				user.id,
				'eventRsvp',
				{ eventId: event.id, status },
			);
		}

		return rsvp;
	}

	@bindThis
	public async getEvent(eventId: string, callerUserId?: string | null): Promise<EventDetail> {
		const event = await this.eventsRepository.findOneBy({ id: eventId });
		if (!event) {
			throw new ApiError(EVENT_ERRORS.noSuchEvent);
		}

		const rsvps = await this.eventRsvpsRepository.find({
			where: { eventId: event.id },
		});

		const attendance: EventAttendanceSummary = {
			going: 0,
			interested: 0,
			notGoing: 0,
		};

		let myRsvp: EventRsvpStatus | null = null;
		for (const r of rsvps) {
			if (r.status === 'going') attendance.going++;
			else if (r.status === 'interested') attendance.interested++;
			else if (r.status === 'not_going') attendance.notGoing++;

			if (callerUserId && r.userId === callerUserId) {
				myRsvp = r.status;
			}
		}

		return {
			event,
			attendance,
			myRsvp,
		};
	}

	@bindThis
	public async listRsvps(eventId: string, user: { id: string }): Promise<MiEventRsvp[]> {
		const event = await this.eventsRepository.findOneBy({ id: eventId });
		if (!event) {
			throw new ApiError(EVENT_ERRORS.noSuchEvent);
		}

		return await this.eventRsvpsRepository.find({
			where: { eventId: event.id },
			relations: ['user'],
			order: { createdAt: 'ASC' },
		});
	}

	@bindThis
	public async processReminder(eventId: string, expectedStartsAtTime?: number): Promise<{ notifiedCount: number }> {
		const event = await this.eventsRepository.findOneBy({ id: eventId });
		if (!event) {
			return { notifiedCount: 0 };
		}

		// 1. Guard against cancelled events
		if (event.isCancelled) {
			return { notifiedCount: 0 };
		}

		// 2. Guard against duplicate reminder deliveries on retry
		if (event.reminderSentAt != null) {
			return { notifiedCount: 0 };
		}

		// 3. Guard against past/expired events
		if (event.startsAt.getTime() <= Date.now()) {
			return { notifiedCount: 0 };
		}

		// 4. Guard against rescheduled events where this job was for an old startsAt time
		if (expectedStartsAtTime !== undefined && event.startsAt.getTime() !== expectedStartsAtTime) {
			return { notifiedCount: 0 };
		}

		// Fetch eligible participants: 'going' and 'interested' only (exclude 'not_going')
		const eligibleRsvps = await this.eventRsvpsRepository.find({
			where: {
				eventId: event.id,
				status: In(['going', 'interested']),
			},
		});

		let notifiedCount = 0;
		for (const rsvp of eligibleRsvps) {
			await this.notificationService.createNotification(
				rsvp.userId,
				null,
				'eventReminder',
				{ eventId: event.id },
			);
			notifiedCount++;
		}

		// Mark reminder as sent to guarantee idempotency across retries
		event.reminderSentAt = new Date();
		await this.eventsRepository.save(event);

		return { notifiedCount };
	}
}
