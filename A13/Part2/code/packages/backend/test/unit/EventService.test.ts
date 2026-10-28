/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, beforeEach, test, expect, vi } from 'vitest';
import { EventService, EventReminderSchedule } from '@/core/EventService.js';
import type { EventsRepository, EventRsvpsRepository, UsersRepository } from '@/models/_.js';
import type { MiEvent } from '@/models/Event.js';
import type { MiEventRsvp } from '@/models/EventRsvp.js';
import type { IdService } from '@/core/IdService.js';
import type { NotificationService } from '@/core/NotificationService.js';
import { ApiError } from '@/server/api/error.js';

describe('EventService', () => {
	let eventService: EventService;

	// In-memory mock storage
	let eventsStore: Map<string, MiEvent>;
	let rsvpsStore: Map<string, MiEventRsvp>;

	let eventsRepoMock: Partial<EventsRepository>;
	let eventRsvpsRepoMock: Partial<EventRsvpsRepository>;
	let usersRepoMock: Partial<UsersRepository>;
	let idServiceMock: Partial<IdService>;
	let notificationServiceMock: Partial<NotificationService>;

	let currentIdCounter = 1;

	beforeEach(() => {
		eventsStore = new Map();
		rsvpsStore = new Map();
		currentIdCounter = 1;

		idServiceMock = {
			gen: vi.fn(() => `id_${currentIdCounter++}`),
		};

		notificationServiceMock = {
			createNotification: vi.fn().mockResolvedValue(null),
		};

		eventsRepoMock = {
			insertOne: vi.fn(async (entity: MiEvent) => {
				eventsStore.set(entity.id, { ...entity });
				return entity;
			}),
			findOneBy: vi.fn(async (query: { id: string }) => {
				const e = eventsStore.get(query.id);
				return e ? { ...e } : null;
			}),
			save: vi.fn(async (entity: MiEvent) => {
				eventsStore.set(entity.id, { ...entity });
				return entity;
			}),
		};

		eventRsvpsRepoMock = {
			insertOne: vi.fn(async (entity: MiEventRsvp) => {
				rsvpsStore.set(entity.id, { ...entity });
				return entity;
			}),
			findOneBy: vi.fn(async (query: { eventId: string; userId: string }) => {
				for (const rsvp of rsvpsStore.values()) {
					if (rsvp.eventId === query.eventId && rsvp.userId === query.userId) {
						return { ...rsvp };
					}
				}
				return null;
			}),
			find: vi.fn(async (options?: any) => {
				const results: MiEventRsvp[] = [];
				for (const rsvp of rsvpsStore.values()) {
					if (options?.where?.eventId && rsvp.eventId !== options.where.eventId) {
						continue;
					}
					if (options?.where?.status && options.where.status._value) {
						const allowed = options.where.status._value;
						if (Array.isArray(allowed) && !allowed.includes(rsvp.status)) {
							continue;
						}
					}
					results.push({ ...rsvp });
				}
				return results;
			}),
			save: vi.fn(async (entity: MiEventRsvp) => {
				rsvpsStore.set(entity.id, { ...entity });
				return entity;
			}),
		};

		usersRepoMock = {
			findOneBy: vi.fn(async () => null),
		};

		eventService = new EventService(
			eventsRepoMock as EventsRepository,
			eventRsvpsRepoMock as EventRsvpsRepository,
			usersRepoMock as UsersRepository,
			idServiceMock as IdService,
			notificationServiceMock as NotificationService,
		);
	});

	// --- 1. Event Creation & Validation ---

	test('1. Successfully create an event using valid inputs and auto-RSVP creator as going', async () => {
		const creator = { id: 'user_alice' };
		const startsAt = new Date(Date.now() + 3600 * 1000 * 24); // Tomorrow
		const endsAt = new Date(Date.now() + 3600 * 1000 * 26);   // Tomorrow + 2h

		const event = await eventService.create(creator, {
			title: 'Misskey Tech Talk',
			description: 'Discussing ActivityPub and design patterns',
			startsAt: startsAt.toISOString(),
			endsAt: endsAt.toISOString(),
			timezone: 'Asia/Tokyo',
			location: 'Tokyo Hall',
			meetingUrl: 'https://meet.misskey.local/room1',
		});

		expect(event).toBeDefined();
		expect(event.title).toBe('Misskey Tech Talk');
		expect(event.userId).toBe('user_alice');
		expect(event.timezone).toBe('Asia/Tokyo');
		expect(event.isCancelled).toBe(false);

		// Creator must automatically be registered as 'going'
		const creatorRsvp = await eventRsvpsRepoMock.findOneBy!({ eventId: event.id, userId: 'user_alice' });
		expect(creatorRsvp).toBeDefined();
		expect(creatorRsvp?.status).toBe('going');
	});

	test('2. Reject invalid or missing required fields', async () => {
		const creator = { id: 'user_alice' };
		const startsAt = new Date(Date.now() + 3600 * 1000);
		const endsAt = new Date(Date.now() + 7200 * 1000);

		// Empty / whitespace title
		await expect(eventService.create(creator, {
			title: '   ',
			startsAt,
			endsAt,
			timezone: 'UTC',
		})).rejects.toThrow(ApiError);

		// Excessively long title (> 128 chars)
		await expect(eventService.create(creator, {
			title: 'A'.repeat(129),
			startsAt,
			endsAt,
			timezone: 'UTC',
		})).rejects.toThrow(ApiError);
	});

	test('3. Reject an invalid time range (start >= end) or invalid timezone', async () => {
		const creator = { id: 'user_alice' };
		const t1 = new Date(Date.now() + 3600 * 1000);
		const t2 = new Date(Date.now() + 1800 * 1000); // Earlier than start

		// Start after End
		await expect(eventService.create(creator, {
			title: 'Time Warped',
			startsAt: t1,
			endsAt: t2,
			timezone: 'UTC',
		})).rejects.toThrow(ApiError);

		// Equal times
		await expect(eventService.create(creator, {
			title: 'Zero Length',
			startsAt: t1,
			endsAt: t1,
			timezone: 'UTC',
		})).rejects.toThrow(ApiError);

		// Invalid IANA timezone
		await expect(eventService.create(creator, {
			title: 'Bad Timezone',
			startsAt: t1,
			endsAt: new Date(t1.getTime() + 3600 * 1000),
			timezone: 'Invalid/NonExistent_Zone',
		})).rejects.toThrow(ApiError);
	});

	test('4. Handle optional location and meeting URLs correctly', async () => {
		const creator = { id: 'user_alice' };
		const startsAt = new Date(Date.now() + 3600 * 1000);
		const endsAt = new Date(Date.now() + 7200 * 1000);

		// Disallow javascript: pseudo-protocol in meetingUrl
		await expect(eventService.create(creator, {
			title: 'XSS attempt',
			startsAt,
			endsAt,
			timezone: 'UTC',
			meetingUrl: 'javascript:alert(1)',
		})).rejects.toThrow(ApiError);

		// Disallow invalid URL syntax
		await expect(eventService.create(creator, {
			title: 'Malformed URL',
			startsAt,
			endsAt,
			timezone: 'UTC',
			meetingUrl: 'not_a_valid_url',
		})).rejects.toThrow(ApiError);

		// Allow valid https meetingUrl
		const validEvent = await eventService.create(creator, {
			title: 'Valid Online Event',
			startsAt,
			endsAt,
			timezone: 'UTC',
			meetingUrl: 'https://conference.example.com/stream',
		});
		expect(validEvent.meetingUrl).toBe('https://conference.example.com/stream');
	});

	// --- 2. Permissions and Event Lifecycle ---

	test('5. Permit the event owner to edit their own event', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Initial Title',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		const updated = await eventService.update(creator, event.id, {
			title: 'Updated Title',
			description: 'New Description',
			location: 'Room 404',
		});

		expect(updated.title).toBe('Updated Title');
		expect(updated.description).toBe('New Description');
		expect(updated.location).toBe('Room 404');
	});

	test('6. Reject unauthorised edits or cancellation attempts', async () => {
		const creator = { id: 'user_alice' };
		const impostor = { id: 'user_mallory' };

		const event = await eventService.create(creator, {
			title: 'Alice Meeting',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		// Impostor cannot edit
		await expect(eventService.update(impostor, event.id, {
			title: 'Hacked Title',
		})).rejects.toThrow(ApiError);

		// Impostor cannot cancel
		await expect(eventService.cancel(impostor, event.id)).rejects.toThrow(ApiError);
	});

	test('7. Verify that cancellation changes the effective event state', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'To Be Cancelled',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		const cancelled = await eventService.cancel(creator, event.id);
		expect(cancelled.isCancelled).toBe(true);

		// Once cancelled, further edits are rejected
		await expect(eventService.update(creator, event.id, {
			title: 'Cannot Edit Cancelled',
		})).rejects.toThrow(ApiError);
	});

	test('8. Verify that rescheduling updates the stored event and reminder schedule', async () => {
		const creator = { id: 'user_alice' };
		const originalStartsAt = new Date(Date.now() + 3600 * 1000);
		const originalEndsAt = new Date(Date.now() + 7200 * 1000);

		const event = await eventService.create(creator, {
			title: 'Rescheduled Event',
			startsAt: originalStartsAt,
			endsAt: originalEndsAt,
			timezone: 'UTC',
		});

		const newStartsAt = new Date(Date.now() + 7200 * 1000);
		const newEndsAt = new Date(Date.now() + 10800 * 1000);

		const updated = await eventService.update(creator, event.id, {
			startsAt: newStartsAt,
			endsAt: newEndsAt,
		});

		expect(updated.startsAt.getTime()).toBe(newStartsAt.getTime());
		expect(updated.endsAt.getTime()).toBe(newEndsAt.getTime());

		// Reminder schedule helper calculates the new lead time
		const schedule = new EventReminderSchedule(updated.startsAt);
		expect(schedule.reminderAt.getTime()).toBe(newStartsAt.getTime() - EventReminderSchedule.DEFAULT_LEAD_TIME_MS);
		expect(schedule.isEligible).toBe(true);
	});

	// --- 3. RSVP Behaviour ---

	test('9. Create a valid RSVP for each of the three supported states', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'RSVP Test Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		const r1 = await eventService.rsvp({ id: 'user_bob' }, event.id, 'going');
		expect(r1.status).toBe('going');

		const r2 = await eventService.rsvp({ id: 'user_carol' }, event.id, 'interested');
		expect(r2.status).toBe('interested');

		const r3 = await eventService.rsvp({ id: 'user_dave' }, event.id, 'not_going');
		expect(r3.status).toBe('not_going');
	});

	test('10. Change a user RSVP and verify that previous state is replaced', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'State Transition Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		const user = { id: 'user_bob' };
		await eventService.rsvp(user, event.id, 'interested');
		let current = await eventRsvpsRepoMock.findOneBy!({ eventId: event.id, userId: 'user_bob' });
		expect(current?.status).toBe('interested');

		// Change to going
		await eventService.rsvp(user, event.id, 'going');
		current = await eventRsvpsRepoMock.findOneBy!({ eventId: event.id, userId: 'user_bob' });
		expect(current?.status).toBe('going');

		// Change to not_going
		await eventService.rsvp(user, event.id, 'not_going');
		current = await eventRsvpsRepoMock.findOneBy!({ eventId: event.id, userId: 'user_bob' });
		expect(current?.status).toBe('not_going');
	});

	test('11. Verify duplicate requests do not create duplicate attendance records', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Idempotency Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		const user = { id: 'user_bob' };
		await eventService.rsvp(user, event.id, 'going');
		await eventService.rsvp(user, event.id, 'going'); // Duplicate submit
		await eventService.rsvp(user, event.id, 'going'); // Another duplicate submit

		const allRsvps = await eventService.listRsvps(event.id, creator);
		const bobRsvps = allRsvps.filter(r => r.userId === 'user_bob');
		expect(bobRsvps.length).toBe(1);
	});

	test('12. Verify appropriate attendance counts and summaries', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Counts Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});
		// Creator is already auto-RSVPed as 'going'

		await eventService.rsvp({ id: 'user_bob' }, event.id, 'going');
		await eventService.rsvp({ id: 'user_carol' }, event.id, 'interested');
		await eventService.rsvp({ id: 'user_dave' }, event.id, 'interested');
		await eventService.rsvp({ id: 'user_eve' }, event.id, 'not_going');

		const detail = await eventService.getEvent(event.id, 'user_bob');
		expect(detail.attendance.going).toBe(2);       // Alice + Bob
		expect(detail.attendance.interested).toBe(2);  // Carol + Dave
		expect(detail.attendance.notGoing).toBe(1);    // Eve
		expect(detail.myRsvp).toBe('going');
	});

	// --- 4. Reminder Behaviour ---

	test('13. Verify reminder is scheduled before the event (15 min lead time)', async () => {
		const startsAt = new Date(Date.now() + 30 * 60 * 1000); // in 30 minutes
		const schedule = new EventReminderSchedule(startsAt);

		expect(schedule.isEligible).toBe(true);
		// Reminder scheduled 15 minutes before startsAt
		expect(schedule.reminderAt.getTime()).toBe(startsAt.getTime() - 15 * 60 * 1000);
		expect(schedule.delayMs).toBeGreaterThan(0);
	});

	test('14. Verify past events do not receive a new reminder schedule', async () => {
		const pastStartsAt = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago
		const schedule = new EventReminderSchedule(pastStartsAt);

		expect(schedule.isEligible).toBe(false);
		expect(schedule.delayMs).toBeLessThanOrEqual(0);
	});

	test('15. Verify that a cancelled event does not generate its reminder', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Cancelled Meeting',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		await eventService.cancel(creator, event.id);

		// Trigger reminder execution
		const result = await eventService.processReminder(event.id);
		expect(result.notifiedCount).toBe(0);
		expect(notificationServiceMock.createNotification).not.toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			'eventReminder',
			expect.anything(),
		);
	});

	test('16. Verify rescheduling does not leave an effective duplicate reminder', async () => {
		const creator = { id: 'user_alice' };
		const oldStartsAt = new Date(Date.now() + 3600 * 1000);
		const event = await eventService.create(creator, {
			title: 'Rescheduled Meeting',
			startsAt: oldStartsAt,
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		const newStartsAt = new Date(Date.now() + 86400 * 1000);
		await eventService.update(creator, event.id, {
			startsAt: newStartsAt,
			endsAt: new Date(Date.now() + 90000 * 1000),
		});

		// Stale job running with old expected start time is ignored
		const staleResult = await eventService.processReminder(event.id, oldStartsAt.getTime());
		expect(staleResult.notifiedCount).toBe(0);
	});

	test('17. Verify that not_going participants are excluded from reminders', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Selective Reminder Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		await eventService.rsvp({ id: 'user_going' }, event.id, 'going');
		await eventService.rsvp({ id: 'user_interested' }, event.id, 'interested');
		await eventService.rsvp({ id: 'user_declined' }, event.id, 'not_going');

		notificationServiceMock.createNotification = vi.fn().mockResolvedValue(null);
		const result = await eventService.processReminder(event.id);

		// Alice (creator), user_going, user_interested should be notified; user_declined excluded
		expect(result.notifiedCount).toBe(3);
		expect(notificationServiceMock.createNotification).not.toHaveBeenCalledWith(
			'user_declined',
			expect.anything(),
			'eventReminder',
			expect.anything(),
		);
		expect(notificationServiceMock.createNotification).toHaveBeenCalledWith(
			'user_going',
			null,
			'eventReminder',
			{ eventId: event.id },
		);
	});

	test('18. Verify retry or repeated processing does not cause duplicate reminder notifications', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Idempotent Reminder Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		notificationServiceMock.createNotification = vi.fn().mockResolvedValue(null);

		// First execution
		const firstRun = await eventService.processReminder(event.id);
		expect(firstRun.notifiedCount).toBe(1); // creator
		expect(notificationServiceMock.createNotification).toHaveBeenCalledTimes(1);

		// Second execution (retry simulation)
		const retryRun = await eventService.processReminder(event.id);
		expect(retryRun.notifiedCount).toBe(0);
		// No additional notifications dispatched
		expect(notificationServiceMock.createNotification).toHaveBeenCalledTimes(1);
	});

	// --- 5. Notification Behaviour ---

	test('19. Verify applicable RSVP changes produce intended notification for creator', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Creator Notification Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		notificationServiceMock.createNotification = vi.fn().mockResolvedValue(null);

		await eventService.rsvp({ id: 'user_bob' }, event.id, 'going');
		expect(notificationServiceMock.createNotification).toHaveBeenCalledWith(
			'user_alice',
			'user_bob',
			'eventRsvp',
			{ eventId: event.id, status: 'going' },
		);
	});

	test('20. Verify relevant event updates and cancellations produce notifications for attendees', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Broadcast Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		await eventService.rsvp({ id: 'user_bob' }, event.id, 'going');
		await eventService.rsvp({ id: 'user_carol' }, event.id, 'interested');

		notificationServiceMock.createNotification = vi.fn().mockResolvedValue(null);

		// Update event
		await eventService.update(creator, event.id, {
			title: 'Broadcast Event (Updated)',
		});

		expect(notificationServiceMock.createNotification).toHaveBeenCalledWith(
			'user_bob',
			'user_alice',
			'eventUpdated',
			{ eventId: event.id },
		);
		expect(notificationServiceMock.createNotification).toHaveBeenCalledWith(
			'user_carol',
			'user_alice',
			'eventUpdated',
			{ eventId: event.id },
		);

		notificationServiceMock.createNotification = vi.fn().mockResolvedValue(null);

		// Cancel event
		await eventService.cancel(creator, event.id);

		expect(notificationServiceMock.createNotification).toHaveBeenCalledWith(
			'user_bob',
			'user_alice',
			'eventCancelled',
			{ eventId: event.id },
		);
		expect(notificationServiceMock.createNotification).toHaveBeenCalledWith(
			'user_carol',
			'user_alice',
			'eventCancelled',
			{ eventId: event.id },
		);
	});

	test('21. Verify notifications are not duplicated when an idempotent RSVP operation is repeated', async () => {
		const creator = { id: 'user_alice' };
		const event = await eventService.create(creator, {
			title: 'Idempotent RSVP Event',
			startsAt: new Date(Date.now() + 3600 * 1000),
			endsAt: new Date(Date.now() + 7200 * 1000),
			timezone: 'UTC',
		});

		notificationServiceMock.createNotification = vi.fn().mockResolvedValue(null);

		// Initial RSVP triggers 1 notification
		await eventService.rsvp({ id: 'user_bob' }, event.id, 'going');
		expect(notificationServiceMock.createNotification).toHaveBeenCalledTimes(1);

		// Repeating identical status does not dispatch another notification
		await eventService.rsvp({ id: 'user_bob' }, event.id, 'going');
		expect(notificationServiceMock.createNotification).toHaveBeenCalledTimes(1);
	});
});
