<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.playerRoot">
	<!-- Audio element -->
	<audio
		ref="audioEl"
		:src="file.url"
		preload="metadata"
		@timeupdate="onTimeUpdate"
		@loadedmetadata="onLoadedMetadata"
		@ended="onEnded"
		@play="isPlaying = true"
		@pause="isPlaying = false"
	></audio>

	<!-- Main player controls -->
	<div :class="$style.mainControls">
		<button
			type="button"
			:class="$style.playBtn"
			:aria-label="isPlaying ? 'Pause' : 'Play'"
			@click="togglePlay"
		>
			<i :class="isPlaying ? 'ti ti-player-pause' : 'ti ti-player-play'"></i>
		</button>

		<div :class="$style.trackInfo">
			<div :class="$style.fileMeta">
				<span :class="$style.fileName"><i class="ti ti-music"></i> {{ file.name || 'Audio Clip' }}</span>
				<span :class="$style.durationLabel">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
			</div>

			<!-- Interactive Waveform Representation -->
			<div :class="$style.waveformContainer" @click="onWaveformClick">
				<div
					v-for="(bar, i) in waveformBars"
					:key="i"
					:class="[
						$style.waveBar,
						(i / waveformBars.length) <= (currentTime / (duration || 1)) && $style.waveBarActive,
					]"
					:style="{ height: `${bar}%` }"
				></div>
			</div>

			<!-- Seek Range (accessible) -->
			<input
				type="range"
				min="0"
				:max="duration || 100"
				:value="currentTime"
				step="0.1"
				aria-label="Audio playback seek"
				:class="$style.seekInput"
				@input="onSeek"
			/>
		</div>

		<!-- Transcript Toggle Button -->
		<button
			type="button"
			:class="[$style.transcriptBtn, showTranscript && $style.transcriptBtnActive]"
			:aria-expanded="showTranscript"
			aria-label="Toggle transcript"
			@click="toggleTranscript"
		>
			<i class="ti ti-file-text"></i>
			<span v-if="transcript && transcript.status === 'approved'" :class="$style.badgePublished">Approved</span>
			<span v-else-if="transcript && transcript.status === 'draft'" :class="$style.badgeDraft">Draft</span>
		</button>
	</div>

	<!-- Expandable Transcript Panel -->
	<div v-if="showTranscript" :class="$style.transcriptPanel">
		<div :class="$style.transcriptHeader">
			<h4><i class="ti ti-notes"></i> Speech-to-Text Transcript</h4>
			<span v-if="transcript" :class="[$style.statusPill, $style[`status_${transcript.status}`]]">
				{{ transcript.status.toUpperCase() }}
			</span>
		</div>

		<!-- Loading / Queued / Processing State -->
		<div v-if="isLoadingTranscript" :class="$style.transcriptLoading">
			<i class="ti ti-loader ti-spin"></i> Processing audio transcription...
		</div>

		<!-- No transcript yet -->
		<div v-else-if="!transcript" :class="$style.transcriptEmpty">
			<p>No transcript available for this audio file.</p>
			<button
				v-if="canManage"
				type="button"
				:class="$style.actionBtn"
				:disabled="isSubmitting"
				@click="requestTranscription"
			>
				<i class="ti ti-sparkles"></i> Generate Transcript
			</button>
		</div>

		<!-- Author Review & Edit Mode (Draft or Review) -->
		<div v-else-if="canManage && (transcript.status === 'draft' || isEditing)" :class="$style.transcriptEditor">
			<textarea
				v-model="draftText"
				rows="4"
				placeholder="Review and correct transcript text before publishing..."
				:class="$style.draftTextarea"
			></textarea>
			<div :class="$style.editorActions">
				<button
					type="button"
					:class="$style.saveBtn"
					:disabled="isSubmitting"
					@click="saveDraft"
				>
					<i class="ti ti-device-floppy"></i> Save Edit
				</button>
				<button
					v-if="transcript.status === 'draft'"
					type="button"
					:class="$style.approveBtn"
					:disabled="isSubmitting || !draftText.trim()"
					@click="approveTranscript"
				>
					<i class="ti ti-check"></i> Approve & Publish
				</button>
			</div>
		</div>

		<!-- Published Reader Display -->
		<div v-else-if="transcript.status === 'approved'" :class="$style.transcriptBody">
			<p :class="$style.publishedText">{{ transcript.text }}</p>
			<div v-if="canManage" :class="$style.manageBar">
				<button type="button" :class="$style.miniBtn" @click="isEditing = true">
					<i class="ti ti-edit"></i> Edit Published Transcript
				</button>
			</div>
		</div>

		<!-- Failed State -->
		<div v-else-if="transcript.status === 'failed'" :class="$style.transcriptError">
			<p><i class="ti ti-alert-triangle"></i> Transcription failed: {{ transcript.errorMessage || 'Unknown error' }}</p>
			<button v-if="canManage" type="button" :class="$style.actionBtn" @click="requestTranscription">
				<i class="ti ti-reload"></i> Retry Transcription
			</button>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import * as Misskey from 'misskey-js';
import { misskeyApi } from '@/misskey-api.js';

const props = defineProps<{
	file: Misskey.entities.DriveFile;
	canManage?: boolean;
}>();

const audioEl = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const showTranscript = ref(false);
const isLoadingTranscript = ref(false);
const isSubmitting = ref(false);
const isEditing = ref(false);
const draftText = ref('');
const transcript = ref<any | null>(null);

// Deterministic waveform bars reflecting pseudo-audio peaks
const waveformBars = computed(() => {
	const count = 36;
	const bars: number[] = [];
	const seed = props.file.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
	for (let i = 0; i < count; i++) {
		const val = 20 + Math.abs(Math.sin((seed + i * 7) * 0.4)) * 75;
		bars.push(Math.round(val));
	}
	return bars;
});

function togglePlay() {
	if (!audioEl.value) return;
	if (isPlaying.value) {
		audioEl.value.pause();
	} else {
		audioEl.value.play().catch(() => {});
	}
}

function onTimeUpdate() {
	if (audioEl.value) {
		currentTime.value = audioEl.value.currentTime;
	}
}

function onLoadedMetadata() {
	if (audioEl.value) {
		duration.value = audioEl.value.duration || 0;
	}
}

function onEnded() {
	isPlaying.value = false;
	currentTime.value = 0;
}

function onSeek(ev: Event) {
	const target = ev.target as HTMLInputElement;
	const val = parseFloat(target.value);
	if (audioEl.value) {
		audioEl.value.currentTime = val;
		currentTime.value = val;
	}
}

function onWaveformClick(ev: MouseEvent) {
	const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
	const clickRatio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
	if (audioEl.value && duration.value > 0) {
		const targetTime = clickRatio * duration.value;
		audioEl.value.currentTime = targetTime;
		currentTime.value = targetTime;
	}
}

function formatTime(sec: number): string {
	if (!sec || isNaN(sec)) return '0:00';
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${s < 10 ? '0' : ''}${s}`;
}

async function toggleTranscript() {
	showTranscript.value = !showTranscript.value;
	if (showTranscript.value && !transcript.value) {
		await loadTranscript();
	}
}

async function loadTranscript() {
	isLoadingTranscript.value = true;
	try {
		const res = await misskeyApi('audio/transcript/show', { fileId: props.file.id });
		transcript.value = res;
		if (res && res.text) {
			draftText.value = res.text;
		}
	} catch {
		transcript.value = null;
	} finally {
		isLoadingTranscript.value = false;
	}
}

async function requestTranscription() {
	isSubmitting.value = true;
	try {
		const res = await misskeyApi('audio/transcribe', { fileId: props.file.id });
		transcript.value = res;
		if (res && res.text) {
			draftText.value = res.text;
		}
	} catch (err: any) {
		alert(err.message || 'Failed to request transcription.');
	} finally {
		isSubmitting.value = false;
	}
}

async function saveDraft() {
	isSubmitting.value = true;
	try {
		const res = await misskeyApi('audio/transcript/update', {
			fileId: props.file.id,
			text: draftText.value,
		});
		transcript.value = res;
		isEditing.value = false;
	} catch (err: any) {
		alert(err.message || 'Failed to save transcript edit.');
	} finally {
		isSubmitting.value = false;
	}
}

async function approveTranscript() {
	isSubmitting.value = true;
	try {
		const res = await misskeyApi('audio/transcript/approve', { fileId: props.file.id });
		transcript.value = res;
		isEditing.value = false;
	} catch (err: any) {
		alert(err.message || 'Failed to approve transcript.');
	} finally {
		isSubmitting.value = false;
	}
}

onMounted(() => {
	// Auto-check for existing transcript
	loadTranscript().catch(() => {});
});
</script>

<style lang="scss" module>
.playerRoot {
	display: flex;
	flex-direction: column;
	background: var(--panel);
	border: 1px solid var(--divider);
	border-radius: var(--radius);
	padding: 12px 16px;
	gap: 10px;
	margin: 6px 0;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.mainControls {
	display: flex;
	align-items: center;
	gap: 12px;
}

.playBtn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: var(--accent);
	color: var(--fgOnAccent, #fff);
	border: none;
	cursor: pointer;
	font-size: 1.3rem;
	transition: transform 0.15s ease, background 0.2s ease;
	flex-shrink: 0;

	&:hover {
		transform: scale(1.05);
	}
}

.trackInfo {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
}

.fileMeta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 0.85rem;
}

.fileName {
	font-weight: bold;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--fg);
}

.durationLabel {
	color: var(--fgSub);
	font-family: monospace;
	font-size: 0.8rem;
}

.waveformContainer {
	display: flex;
	align-items: center;
	height: 28px;
	gap: 2px;
	cursor: pointer;
	padding: 2px 0;
}

.waveBar {
	flex: 1;
	background: var(--divider);
	border-radius: 2px;
	min-height: 4px;
	transition: background 0.15s ease, height 0.2s ease;

	&.waveBarActive {
		background: var(--accent);
	}
}

.seekInput {
	width: 100%;
	height: 4px;
	accent-color: var(--accent);
	cursor: pointer;
	margin-top: 2px;
}

.transcriptBtn {
	display: flex;
	align-items: center;
	gap: 5px;
	background: var(--bg);
	border: 1px solid var(--divider);
	border-radius: 6px;
	padding: 6px 10px;
	font-size: 0.85rem;
	cursor: pointer;
	color: var(--fg);
	transition: all 0.2s ease;

	&:hover, &.transcriptBtnActive {
		border-color: var(--accent);
		color: var(--accent);
	}
}

.badgePublished {
	background: #10b981;
	color: #fff;
	font-size: 0.65rem;
	padding: 1px 5px;
	border-radius: 4px;
}

.badgeDraft {
	background: #f59e0b;
	color: #fff;
	font-size: 0.65rem;
	padding: 1px 5px;
	border-radius: 4px;
}

.transcriptPanel {
	margin-top: 8px;
	padding-top: 10px;
	border-top: 1px dashed var(--divider);
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.transcriptHeader {
	display: flex;
	justify-content: space-between;
	align-items: center;

	h4 {
		margin: 0;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		gap: 5px;
	}
}

.statusPill {
	font-size: 0.7rem;
	font-weight: bold;
	padding: 2px 8px;
	border-radius: 999px;

	&.status_approved {
		background: rgba(16, 185, 129, 0.15);
		color: #10b981;
	}
	&.status_draft {
		background: rgba(245, 158, 11, 0.15);
		color: #f59e0b;
	}
	&.status_failed {
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
	}
}

.draftTextarea {
	width: 100%;
	padding: 8px;
	border: 1px solid var(--divider);
	border-radius: var(--radius);
	background: var(--bg);
	color: var(--fg);
	font-size: 0.9rem;
	resize: vertical;
}

.editorActions {
	display: flex;
	gap: 8px;
	justify-content: flex-end;
}

.saveBtn, .approveBtn, .actionBtn {
	padding: 6px 12px;
	border-radius: var(--radius);
	font-size: 0.85rem;
	font-weight: bold;
	border: none;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 5px;
}

.saveBtn {
	background: var(--bg);
	border: 1px solid var(--divider);
	color: var(--fg);
}

.approveBtn {
	background: #10b981;
	color: #fff;
}

.actionBtn {
	background: var(--accent);
	color: #fff;
}

.publishedText {
	margin: 0;
	font-size: 0.9rem;
	line-height: 1.5;
	color: var(--fg);
	background: var(--bg);
	padding: 10px;
	border-radius: var(--radius);
}

.manageBar {
	display: flex;
	justify-content: flex-end;
	margin-top: 4px;
}

.miniBtn {
	background: transparent;
	border: none;
	color: var(--accent);
	font-size: 0.8rem;
	cursor: pointer;
	text-decoration: underline;
}

.transcriptError {
	color: #ef4444;
	font-size: 0.85rem;
}
</style>
