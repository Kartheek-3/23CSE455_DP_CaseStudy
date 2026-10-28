<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="mk-event-card" :class="{ cancelled: event.isCancelled }">
	<header class="header">
		<div class="title-row">
			<h3 class="title">{{ event.title }}</h3>
			<span v-if="event.isCancelled" class="badge cancelled-badge">Cancelled</span>
		</div>
		<div class="time-row">
			<span class="time-icon">📅</span>
			<time :datetime="event.startsAt">{{ formattedTime }}</time>
			<span class="timezone">({{ event.timezone }})</span>
		</div>
	</header>

	<div v-if="event.description" class="description">
		{{ event.description }}
	</div>

	<div class="meta-details">
		<div v-if="event.location" class="meta-item location">
			<span class="icon">📍</span>
			<span>{{ event.location }}</span>
		</div>
		<div v-if="event.meetingUrl" class="meta-item meeting-url">
			<span class="icon">🔗</span>
			<a :href="event.meetingUrl" target="_blank" rel="noopener noreferrer">Join Online Meeting</a>
		</div>
	</div>

	<div class="attendance-summary">
		<span class="count going-count"><strong>{{ attendance.going }}</strong> Going</span>
		<span class="count interested-count"><strong>{{ attendance.interested }}</strong> Interested</span>
		<span v-if="attendance.notGoing > 0" class="count not-going-count">{{ attendance.notGoing }} Not Going</span>
	</div>

	<footer v-if="!event.isCancelled" class="actions">
		<div class="rsvp-buttons">
			<button
				type="button"
				class="btn rsvp-btn"
				:class="{ active: myRsvp === 'going' }"
				@click="onRsvp('going')"
			>
				Going
			</button>
			<button
				type="button"
				class="btn rsvp-btn"
				:class="{ active: myRsvp === 'interested' }"
				@click="onRsvp('interested')"
			>
				Interested
			</button>
			<button
				type="button"
				class="btn rsvp-btn"
				:class="{ active: myRsvp === 'not_going' }"
				@click="onRsvp('not_going')"
			>
				Not Going
			</button>
		</div>

		<div v-if="isOwner" class="owner-controls">
			<button type="button" class="btn btn-secondary" @click="$emit('edit')">Edit</button>
			<button type="button" class="btn btn-danger" @click="$emit('cancel')">Cancel</button>
		</div>
	</footer>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type EventData = {
	id: string;
	userId: string;
	title: string;
	description?: string | null;
	startsAt: string;
	endsAt: string;
	timezone: string;
	location?: string | null;
	meetingUrl?: string | null;
	isCancelled: boolean;
};

export type AttendanceData = {
	going: number;
	interested: number;
	notGoing: number;
};

const props = defineProps<{
	event: EventData;
	attendance: AttendanceData;
	myRsvp?: 'going' | 'interested' | 'not_going' | null;
	isOwner?: boolean;
}>();

const emit = defineEmits<{
	(e: 'rsvp', status: 'going' | 'interested' | 'not_going'): void;
	(e: 'edit'): void;
	(e: 'cancel'): void;
}>();

const formattedTime = computed(() => {
	try {
		const start = new Date(props.event.startsAt);
		const end = new Date(props.event.endsAt);
		return `${start.toLocaleString()} - ${end.toLocaleTimeString()}`;
	} catch {
		return `${props.event.startsAt} - ${props.event.endsAt}`;
	}
});

function onRsvp(status: 'going' | 'interested' | 'not_going') {
	emit('rsvp', status);
}
</script>

<style lang="scss" scoped>
.mk-event-card {
	padding: 16px;
	border-radius: 8px;
	border: 1px solid var(--divider, #e2e8f0);
	background: var(--panel, #ffffff);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

	&.cancelled {
		opacity: 0.7;
		background: var(--bg-dim, #f8fafc);
	}

	.header {
		margin-bottom: 8px;

		.title-row {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.title {
				margin: 0;
				font-size: 1.15rem;
				font-weight: bold;
			}

			.cancelled-badge {
				background: #ef4444;
				color: #ffffff;
				padding: 2px 8px;
				border-radius: 4px;
				font-size: 0.75rem;
				font-weight: bold;
			}
		}

		.time-row {
			margin-top: 4px;
			font-size: 0.875rem;
			color: var(--fg-dim, #64748b);
			display: flex;
			gap: 6px;
			align-items: center;
		}
	}

	.description {
		margin: 8px 0;
		font-size: 0.95rem;
		white-space: pre-wrap;
	}

	.meta-details {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 8px 0;
		font-size: 0.875rem;

		.meta-item {
			display: flex;
			align-items: center;
			gap: 6px;
		}
	}

	.attendance-summary {
		display: flex;
		gap: 12px;
		margin: 12px 0 8px 0;
		font-size: 0.85rem;

		.going-count {
			color: #10b981;
		}

		.interested-count {
			color: #3b82f6;
		}

		.not-going-count {
			color: #94a3b8;
		}
	}

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px dashed var(--divider, #e2e8f0);

		.rsvp-buttons {
			display: flex;
			gap: 6px;

			.btn {
				padding: 6px 12px;
				border-radius: 6px;
				border: 1px solid var(--divider, #cbd5e1);
				background: transparent;
				cursor: pointer;
				font-size: 0.85rem;
				transition: all 0.15s ease;

				&.active {
					background: var(--accent, #6366f1);
					color: #ffffff;
					border-color: var(--accent, #6366f1);
				}

				&:hover:not(.active) {
					background: var(--bg-hover, #f1f5f9);
				}
			}
		}

		.owner-controls {
			display: flex;
			gap: 6px;

			.btn {
				padding: 4px 8px;
				font-size: 0.8rem;
				border-radius: 4px;
				cursor: pointer;
			}

			.btn-danger {
				background: #ef4444;
				color: #ffffff;
				border: none;
			}
		}
	}
}
</style>
