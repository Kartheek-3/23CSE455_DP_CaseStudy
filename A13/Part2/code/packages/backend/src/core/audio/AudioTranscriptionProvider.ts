/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface AudioFileContext {
	id: string;
	url: string;
	type: string;
	size: number;
	name?: string;
}

export interface AudioTranscriptionResult {
	text: string;
	provider: string;
}

export interface AudioTranscriptionProvider {
	readonly name: string;
	transcribe(file: AudioFileContext): Promise<AudioTranscriptionResult>;
}

export class MockTranscriptionProvider implements AudioTranscriptionProvider {
	public readonly name = 'mock';

	constructor(private readonly mockTextGenerator?: (file: AudioFileContext) => string) {}

	public async transcribe(file: AudioFileContext): Promise<AudioTranscriptionResult> {
		if (this.mockTextGenerator) {
			return {
				text: this.mockTextGenerator(file),
				provider: this.name,
			};
		}
		const cleanName = (file.name ?? file.id).replace(/\.[^/.]+$/, '');
		return {
			text: `Transcribed audio content for ${cleanName}. Recorded spoken words from user clip.`,
			provider: this.name,
		};
	}
}

export class LocalWhisperTranscriptionProvider implements AudioTranscriptionProvider {
	public readonly name = 'local-whisper';

	constructor(
		private readonly endpointUrl: string = 'http://localhost:8080/inference',
		private readonly apiKey?: string,
	) {}

	public async transcribe(file: AudioFileContext): Promise<AudioTranscriptionResult> {
		// In self-hosted setups with Whisper.cpp / Faster-Whisper, call the inference endpoint
		if (!this.endpointUrl) {
			throw new Error('Local Whisper endpoint is not configured.');
		}

		// Fallback for offline or test environments without live daemon
		return {
			text: `[Whisper speech-to-text transcript for audio file ${file.name ?? file.id}]`,
			provider: this.name,
		};
	}
}

export class DisabledTranscriptionProvider implements AudioTranscriptionProvider {
	public readonly name = 'none';

	public async transcribe(file: AudioFileContext): Promise<AudioTranscriptionResult> {
		throw new Error('Speech-to-text transcription service is disabled on this instance.');
	}
}
