/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface AudioRecordingResult {
	blob: Blob;
	durationSec: number;
	mimeType: string;
}

export class AudioRecorder {
	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];
	private stream: MediaStream | null = null;
	private startTime: number = 0;
	private durationSec: number = 0;

	public static isSupported(): boolean {
		return typeof window !== 'undefined' &&
			!!window.navigator?.mediaDevices?.getUserMedia &&
			typeof MediaRecorder !== 'undefined';
	}

	public async start(): Promise<void> {
		if (!AudioRecorder.isSupported()) {
			throw new Error('Audio recording is not supported in this browser.');
		}

		try {
			this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (err: any) {
			if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
				throw new Error('Microphone permission was denied.');
			}
			throw new Error(`Failed to access microphone: ${err.message}`);
		}

		this.audioChunks = [];
		const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
		this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data && event.data.size > 0) {
				this.audioChunks.push(event.data);
			}
		};

		this.startTime = Date.now();
		this.mediaRecorder.start(100);
	}

	public async stop(): Promise<AudioRecordingResult> {
		return new Promise((resolve, reject) => {
			if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
				return reject(new Error('MediaRecorder is not recording.'));
			}

			this.durationSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

			this.mediaRecorder.onstop = () => {
				const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
				const audioBlob = new Blob(this.audioChunks, { type: mimeType });

				// Release microphone track
				if (this.stream) {
					this.stream.getTracks().forEach(track => track.stop());
					this.stream = null;
				}

				resolve({
					blob: audioBlob,
					durationSec: this.durationSec,
					mimeType,
				});
			};

			this.mediaRecorder.stop();
		});
	}

	public cancel(): void {
		if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
			this.mediaRecorder.stop();
		}
		if (this.stream) {
			this.stream.getTracks().forEach(track => track.stop());
			this.stream = null;
		}
		this.audioChunks = [];
	}
}
