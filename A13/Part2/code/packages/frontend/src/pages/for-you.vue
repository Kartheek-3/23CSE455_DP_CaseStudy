<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<div :class="$style.toolbar">
			<div :class="$style.modeSelector">
				<button
					:class="[$style.modeBtn, { [$style.active]: mode === 'personalized' }]"
					class="_button"
					@click="setMode('personalized')"
				>
					<i class="ti ti-sparkles"></i> For You (Personalized)
				</button>
				<button
					:class="[$style.modeBtn, { [$style.active]: mode === 'chronological' }]"
					class="_button"
					@click="setMode('chronological')"
				>
					<i class="ti ti-clock"></i> Chronological
				</button>
			</div>

			<button
				:class="$style.prefBtn"
				class="_button"
				@click="openPreferencesModal()"
			>
				<i class="ti ti-adjustments"></i> Controls
			</button>
		</div>

		<MkPagination :key="paginationKey" :paginator="paginator">
			<template #empty>
				<div :class="$style.emptyState">
					<i class="ti ti-sparkles" :class="$style.emptyIcon"></i>
					<div :class="$style.emptyTitle">No recommendations available yet</div>
					<div :class="$style.emptyDesc">
						Interact with posts or set your preferred topics in Controls to customize your personalized feed.
					</div>
					<MkButton primary rounded @click="openPreferencesModal()">
						<i class="ti ti-adjustments"></i> Open Controls
					</MkButton>
				</div>
			</template>

			<template #default="{ items }">
				<MkNote v-for="item in items" :key="item.id" :note="item" :class="$style.note"/>
			</template>
		</MkPagination>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, markRaw, computed } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkNote from '@/components/MkNote.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import { Paginator } from '@/utility/paginator.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import * as os from '@/os.js';

const mode = ref<'personalized' | 'chronological'>('personalized');
const paginationKey = ref(0);

const paginator = computed(() => {
	return markRaw(new Paginator('recommendations/for-you', {
		limit: 10,
		mode: mode.value,
	}));
});

function setMode(newMode: 'personalized' | 'chronological') {
	mode.value = newMode;
	paginationKey.value++;
}

async function openPreferencesModal() {
	try {
		const pref = await misskeyApi('recommendations/preferences', {});
		const preferredText = (pref.preferredTopics ?? []).join(', ');
		const mutedText = (pref.mutedTopics ?? []).join(', ');
		const reducedText = (pref.reducedAuthors ?? []).join(', ');

		const { canceled, result } = await os.form('Recommendation Controls', {
			preferredTopics: {
				type: 'string',
				label: 'Preferred Topics (comma-separated)',
				description: 'Explicit topics and hashtags to prioritize in For You.',
				default: preferredText,
			},
			mutedTopics: {
				type: 'string',
				label: 'Muted Topics (comma-separated)',
				description: 'Topics and hashtags to strictly exclude from recommendations.',
				default: mutedText,
			},
			reducedAuthors: {
				type: 'string',
				label: 'Reduced Authors (comma-separated user IDs)',
				description: 'Authors whose recommendations should be heavily suppressed.',
				default: reducedText,
			},
			resetProfile: {
				type: 'boolean',
				label: 'Reset recommendation profile',
				description: 'Clear all recommendation weights and preferences back to defaults.',
				default: false,
			},
		});

		if (canceled) return;

		if (result.resetProfile) {
			const { canceled: confirmCanceled } = await os.confirm({
				type: 'warning',
				text: 'Are you sure you want to reset your recommendation profile? This will clear all topic preferences and inferred weights. Your notes, bookmarks, and follows will NOT be affected.',
			});

			if (!confirmCanceled) {
				await misskeyApi('recommendations/preferences/reset', {});
				os.alert({
					type: 'success',
					text: 'Recommendation profile reset successfully.',
				});
				paginationKey.value++;
			}
			return;
		}

		const preferred = (result.preferredTopics as string)
			.split(',')
			.map(s => s.trim().replace(/^#/, ''))
			.filter(Boolean);

		const muted = (result.mutedTopics as string)
			.split(',')
			.map(s => s.trim().replace(/^#/, ''))
			.filter(Boolean);

		const reduced = (result.reducedAuthors as string)
			.split(',')
			.map(s => s.trim())
			.filter(Boolean);

		await misskeyApi('recommendations/preferences/update', {
			preferredTopics: preferred,
			mutedTopics: muted,
			reducedAuthors: reduced,
		});

		os.alert({
			type: 'success',
			text: 'Recommendation preferences updated.',
		});
		paginationKey.value++;
	} catch (err: any) {
		os.alert({
			type: 'error',
			text: err?.message ?? 'Failed to update preferences',
		});
	}
}

definePage(() => ({
	title: 'For You',
	icon: 'ti ti-sparkles',
}));
</script>

<style lang="scss" module>
.toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	margin-bottom: 12px;
	background: var(--MI_THEME-panel);
	border-radius: var(--MI-radius);
	flex-wrap: wrap;
	gap: 10px;
}

.modeSelector {
	display: flex;
	background: var(--MI_THEME-bg);
	border-radius: var(--MI-radius);
	padding: 3px;
	gap: 4px;
}

.modeBtn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	border-radius: calc(var(--MI-radius) - 2px);
	font-size: 90%;
	font-weight: 500;
	color: var(--MI_THEME-fg);
	transition: all 0.2s ease;

	&.active {
		background: var(--MI_THEME-accent);
		color: #fff;
	}
}

.prefBtn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	border-radius: var(--MI-radius);
	background: var(--MI_THEME-bg);
	color: var(--MI_THEME-fg);
	font-size: 90%;
	font-weight: 500;
	transition: background 0.2s ease;

	&:hover {
		background: var(--MI_THEME-accentedBg);
	}
}

.note {
	background: var(--MI_THEME-panel);
	border-radius: var(--MI-radius);
	margin-bottom: 8px;
}

.emptyState {
	text-align: center;
	padding: 48px 24px;
	background: var(--MI_THEME-panel);
	border-radius: var(--MI-radius);
}

.emptyIcon {
	font-size: 48px;
	color: var(--MI_THEME-accent);
	margin-bottom: 16px;
}

.emptyTitle {
	font-size: 110%;
	font-weight: bold;
	margin-bottom: 8px;
}

.emptyDesc {
	color: var(--MI_THEME-fgSub);
	font-size: 90%;
	max-width: 400px;
	margin: 0 auto 20px auto;
	line-height: 1.5;
}
</style>
