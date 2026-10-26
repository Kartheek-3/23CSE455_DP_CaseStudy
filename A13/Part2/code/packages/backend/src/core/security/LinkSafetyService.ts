/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as net from 'node:net';
import punycode from 'node:punycode';
import ipaddr from 'ipaddr.js';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { FlaggedLinksRepository, AbuseUserReportsRepository } from '@/models/_.js';
import { MiFlaggedLink, type LinkRiskCategory, type LinkThreatType, type LinkFlagSource } from '@/models/FlaggedLink.js';
import { IdService } from '@/core/IdService.js';
import {
	type LinkReputationProvider,
	type LinkReputationResult,
	type NormalizedUrl,
	LocalListReputationProvider,
} from './LinkReputationProvider.js';

export interface LinkRiskAssessment {
	url: string;
	canonicalUrl: string;
	domain: string;
	category: LinkRiskCategory;
	threatType: LinkThreatType;
	reason: string;
	confidence: number;
	provider: string;
	checkedAt: string;
}

interface CacheEntry {
	assessment: LinkRiskAssessment;
	expiresAt: number;
}

interface PostingEvent {
	userId?: string;
	ip?: string;
	canonicalUrl: string;
	domain: string;
	timestamp: number;
}

const PROTECTED_DOMAINS = [
	'misskey.io',
	'google.com',
	'paypal.com',
	'github.com',
	'apple.com',
	'microsoft.com',
	'amazon.com',
	'facebook.com',
	'twitter.com',
	'x.com',
	'instagram.com',
];

const HOMOGLYPH_MAP: Record<string, string> = {
	'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y', 'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q',
	'α': 'a', 'ο': 'o', 'ρ': 'p', 'ν': 'v', 'τ': 't', 'ι': 'i',
};

@Injectable()
export class LinkSafetyService {
	private provider: LinkReputationProvider;
	private cache = new Map<string, CacheEntry>();
	private postingHistory: PostingEvent[] = [];

	constructor(
		@Optional() @Inject(DI.flaggedLinksRepository)
		private flaggedLinksRepository?: FlaggedLinksRepository,
		@Optional() @Inject(DI.abuseUserReportsRepository)
		private abuseUserReportsRepository?: AbuseUserReportsRepository,
		@Optional() @Inject(DI.id)
		private idService?: IdService,
		provider?: LinkReputationProvider,
	) {
		this.provider = provider ?? new LocalListReputationProvider();
	}

	public setProvider(provider: LinkReputationProvider): void {
		this.provider = provider;
	}

	public getProvider(): LinkReputationProvider {
		return this.provider;
	}

	public normalizeUrl(raw: string): NormalizedUrl | null {
		const trimmed = raw.trim();
		let parsed: URL;
		try {
			parsed = new URL(trimmed);
		} catch {
			return null;
		}

		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return null;
		}

		let hostname = parsed.hostname.toLowerCase();
		while (hostname.endsWith('.')) {
			hostname = hostname.slice(0, -1);
		}

		if (!hostname) {
			return null;
		}

		const hasUserInfo = parsed.username !== '' || parsed.password !== '';
		const userInfo = hasUserInfo ? `${parsed.username}:${parsed.password}` : undefined;

		let port = parsed.port;
		if ((parsed.protocol === 'http:' && port === '80') || (parsed.protocol === 'https:' && port === '443')) {
			port = '';
		}

		const isIp = net.isIP(hostname) !== 0 || ipaddr.isValid(hostname);
		let ipAddress: string | undefined;
		if (isIp) {
			ipAddress = hostname.replace(/^\[|\]$/g, '');
		}

		const isPunycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
		let unicodeHostname = hostname;
		try {
			if (isPunycode) {
				unicodeHostname = punycode.toUnicode(hostname);
			}
		} catch {
			unicodeHostname = hostname;
		}

		const canonicalPort = port ? `:${port}` : '';
		const canonical = `${parsed.protocol}//${hostname}${canonicalPort}${parsed.pathname}${parsed.search}`;

		return {
			raw: trimmed,
			canonical,
			protocol: parsed.protocol,
			hostname,
			port,
			pathname: parsed.pathname,
			search: parsed.search,
			hasUserInfo,
			userInfo,
			isIp,
			ipAddress,
			isPunycode,
			unicodeHostname,
		};
	}

	public validateDestinationSafety(rawOrHost: string): { safe: boolean; reason?: string; ip?: string } {
		let host = rawOrHost.trim().toLowerCase();
		if (host.includes('://')) {
			try {
				host = new URL(host).hostname.toLowerCase();
			} catch {
				return { safe: false, reason: 'Malformed destination URL' };
			}
		}

		while (host.endsWith('.')) {
			host = host.slice(0, -1);
		}

		if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
			return { safe: false, reason: 'Destination host is loopback or internal local name' };
		}

		const cleanIp = host.replace(/^\[|\]$/g, '');
		if (ipaddr.isValid(cleanIp)) {
			try {
				let parsed = ipaddr.parse(cleanIp);
				if (parsed.kind() === 'ipv6' && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) {
					parsed = (parsed as ipaddr.IPv6).toIPv4Address();
				}

				const range = parsed.range();
				if (range !== 'unicast') {
					return {
						safe: false,
						ip: cleanIp,
						reason: `Destination IP is non-unicast/prohibited range: ${range}`,
					};
				}
			} catch (err) {
				return { safe: false, ip: cleanIp, reason: 'Invalid or unparsable IP destination' };
			}
		}

		return { safe: true };
	}

	public detectHomographs(target: NormalizedUrl): { isHomograph: boolean; matchedDomain?: string; reason?: string } {
		const host = target.hostname;
		const unicodeHost = target.unicodeHostname;

		// Convert unicode characters using homoglyph mapping
		let skeleton = '';
		for (const char of unicodeHost) {
			skeleton += HOMOGLYPH_MAP[char] ?? char;
		}

		for (const protectedDomain of PROTECTED_DOMAINS) {
			if (host === protectedDomain) {
				continue;
			}

			if (skeleton === protectedDomain || skeleton.endsWith(`.${protectedDomain}`)) {
				return {
					isHomograph: true,
					matchedDomain: protectedDomain,
					reason: `Suspicious homograph / IDN lookalike imitating trusted domain '${protectedDomain}'`,
				};
			}
		}

		return { isHomograph: false };
	}

	public recordPostingActivity(
		userId: string | undefined,
		ip: string | undefined,
		canonicalUrl: string,
		domain: string,
	): void {
		const now = Date.now();
		this.postingHistory.push({
			userId,
			ip,
			canonicalUrl,
			domain,
			timestamp: now,
		});

		// Prune older than 10 minutes
		const cutoff = now - 10 * 60 * 1000;
		this.postingHistory = this.postingHistory.filter(e => e.timestamp >= cutoff);
	}

	public analyzeSpamFrequency(
		userId: string | undefined,
		ip: string | undefined,
		canonicalUrl: string,
		domain: string,
	): { isSpam: boolean; reason?: string } {
		if (!userId && !ip) {
			return { isSpam: false };
		}

		const now = Date.now();
		const fiveMinAgo = now - 5 * 60 * 1000;
		const tenMinAgo = now - 10 * 60 * 1000;

		const userEvents = this.postingHistory.filter(e =>
			(userId && e.userId === userId) || (ip && e.ip === ip),
		);

		// Signal 1: Repeated identical URL posted > 2 times within 5 minutes
		const identicalUrlCount = userEvents.filter(e =>
			e.timestamp >= fiveMinAgo && e.canonicalUrl === canonicalUrl,
		).length;

		if (identicalUrlCount >= 2) {
			return {
				isSpam: true,
				reason: `Repeated promotional posting of the same link (${identicalUrlCount + 1} occurrences in 5m)`,
			};
		}

		// Signal 2: High volume of links to the same destination domain within 10 minutes
		const sameDomainCount = userEvents.filter(e =>
			e.timestamp >= tenMinAgo && e.domain === domain,
		).length;

		if (sameDomainCount >= 4) {
			return {
				isSpam: true,
				reason: `High-frequency link bursts to destination domain '${domain}' (${sameDomainCount + 1} occurrences in 10m)`,
			};
		}

		return { isSpam: false };
	}

	public async checkAbuseReportsForDomain(domain: string): Promise<{ reported: boolean; count: number; reason?: string }> {
		if (!this.abuseUserReportsRepository) {
			return { reported: false, count: 0 };
		}

		try {
			const reports = await this.abuseUserReportsRepository.find({
				take: 100,
				order: { createdAt: 'DESC' },
			});

			const relevant = reports.filter(r => r.comment && r.comment.includes(domain));
			// Deduplicate by reporter to resist coordinated gaming
			const uniqueReporters = new Set(relevant.map(r => r.reporterId));
			const count = uniqueReporters.size;

			if (count >= 3) {
				return {
					reported: true,
					count,
					reason: `Destination domain has ${count} independent abuse reports on record`,
				};
			}

			return { reported: false, count };
		} catch {
			return { reported: false, count: 0 };
		}
	}

	public async checkUrl(
		rawUrl: string,
		context?: { userId?: string; ip?: string; noteId?: string },
	): Promise<LinkRiskAssessment> {
		const nowIso = new Date().toISOString();
		const normalized = this.normalizeUrl(rawUrl);

		if (!normalized) {
			return {
				url: rawUrl,
				canonicalUrl: rawUrl,
				domain: '',
				category: 'suspicious',
				threatType: 'none',
				reason: 'Malformed URL or unsupported scheme (only http/https permitted)',
				confidence: 0.9,
				provider: 'url-canonicalizer',
				checkedAt: nowIso,
			};
		}

		// Check SSRF & prohibited destination addresses
		const destSafety = this.validateDestinationSafety(normalized.canonical);
		if (!destSafety.safe) {
			const assessment: LinkRiskAssessment = {
				url: rawUrl,
				canonicalUrl: normalized.canonical,
				domain: normalized.hostname,
				category: 'malicious',
				threatType: 'ip_direct',
				reason: destSafety.reason ?? 'Prohibited network destination',
				confidence: 1.0,
				provider: 'ssrf-guard',
				checkedAt: nowIso,
			};
			await this.persistFlagRecord(assessment, context);
			return assessment;
		}

		// Check homograph / confusable spoofing
		const homographResult = this.detectHomographs(normalized);
		if (homographResult.isHomograph) {
			const assessment: LinkRiskAssessment = {
				url: rawUrl,
				canonicalUrl: normalized.canonical,
				domain: normalized.hostname,
				category: 'suspicious',
				threatType: 'homograph',
				reason: homographResult.reason!,
				confidence: 0.9,
				provider: 'homograph-detector',
				checkedAt: nowIso,
			};
			this.setCache(normalized.canonical, assessment, 60 * 60 * 1000);
			await this.persistFlagRecord(assessment, context);
			return assessment;
		}

		// Check spam repetition signals for current context
		const spamCheck = this.analyzeSpamFrequency(
			context?.userId,
			context?.ip,
			normalized.canonical,
			normalized.hostname,
		);
		if (spamCheck.isSpam) {
			const assessment: LinkRiskAssessment = {
				url: rawUrl,
				canonicalUrl: normalized.canonical,
				domain: normalized.hostname,
				category: 'suspicious',
				threatType: 'spam',
				reason: spamCheck.reason!,
				confidence: 0.85,
				provider: 'spam-frequency-analyzer',
				checkedAt: nowIso,
			};
			this.recordPostingActivity(context?.userId, context?.ip, normalized.canonical, normalized.hostname);
			await this.persistFlagRecord(assessment, context);
			return assessment;
		}

		// Check cache for reputation & static results
		const cacheKey = normalized.canonical;
		const cached = this.cache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) {
			this.recordPostingActivity(context?.userId, context?.ip, normalized.canonical, normalized.hostname);
			return cached.assessment;
		}

		// Query reputation provider strategy
		let providerResult: LinkReputationResult;
		try {
			providerResult = await this.provider.classify(normalized);
		} catch (err) {
			// Gracefully handle provider timeout/error without falsely labelling safe or malicious
			const fallback: LinkRiskAssessment = {
				url: rawUrl,
				canonicalUrl: normalized.canonical,
				domain: normalized.hostname,
				category: 'unknown',
				threatType: 'none',
				reason: `Reputation provider failed: ${(err as Error).message}`,
				confidence: 0.0,
				provider: this.provider.name,
				checkedAt: nowIso,
			};
			this.setCache(cacheKey, fallback, 2 * 60 * 1000); // short TTL for transient failures
			return fallback;
		}

		// Check abuse reports correlation if domain is still unknown
		if (providerResult.category === 'unknown') {
			const reportCheck = await this.checkAbuseReportsForDomain(normalized.hostname);
			if (reportCheck.reported) {
				providerResult = {
					category: 'suspicious',
					threatType: 'spam',
					reason: reportCheck.reason!,
					confidence: 0.75,
					provider: 'abuse-reports-correlator',
				};
			}
		}

		const finalAssessment: LinkRiskAssessment = {
			url: rawUrl,
			canonicalUrl: normalized.canonical,
			domain: normalized.hostname,
			category: providerResult.category,
			threatType: providerResult.threatType,
			reason: providerResult.reason,
			confidence: providerResult.confidence,
			provider: providerResult.provider,
			checkedAt: nowIso,
		};

		// Cache TTL: 1 hr for risks, 6 hrs for benign, 5 min for unknown
		const ttl = providerResult.category === 'benign'
			? 6 * 60 * 60 * 1000
			: providerResult.category === 'unknown'
				? 5 * 60 * 1000
				: 60 * 60 * 1000;

		this.setCache(cacheKey, finalAssessment, ttl);

		// Record posting history if valid
		this.recordPostingActivity(context?.userId, context?.ip, normalized.canonical, normalized.hostname);

		// Persist for admin review if flagged
		if (finalAssessment.category === 'malicious' || finalAssessment.category === 'suspicious') {
			await this.persistFlagRecord(finalAssessment, context);
		}

		return finalAssessment;
	}

	public async checkText(
		text: string,
		context?: { userId?: string; ip?: string; noteId?: string },
	): Promise<LinkRiskAssessment[]> {
		const urlRegex = /https?:\/\/[^\s<>"'()[\]{}]+/gi;
		const matches = text.match(urlRegex) ?? [];
		const unique = Array.from(new Set(matches));

		const results: LinkRiskAssessment[] = [];
		for (const u of unique) {
			results.push(await this.checkUrl(u, context));
		}
		return results;
	}

	private setCache(key: string, assessment: LinkRiskAssessment, ttlMs: number): void {
		this.cache.set(key, {
			assessment,
			expiresAt: Date.now() + ttlMs,
		});
	}

	public clearCache(): void {
		this.cache.clear();
	}

	private async persistFlagRecord(
		assessment: LinkRiskAssessment,
		context?: { userId?: string; ip?: string; noteId?: string },
	): Promise<void> {
		if (!this.flaggedLinksRepository) return;

		try {
			const existing = await this.flaggedLinksRepository.findOne({
				where: { canonicalUrl: assessment.canonicalUrl },
			});

			const now = new Date();
			if (existing) {
				existing.reason = assessment.reason;
				existing.riskCategory = assessment.category as any;
				existing.threatType = assessment.threatType as any;
				existing.updatedAt = now;
				await this.flaggedLinksRepository.save(existing);
				return;
			}

			const record = new MiFlaggedLink();
			record.id = this.idService ? this.idService.generate() : Math.random().toString(36).slice(2, 18);
			record.url = assessment.url;
			record.canonicalUrl = assessment.canonicalUrl;
			record.domain = assessment.domain;
			record.riskCategory = assessment.category as any;
			record.reason = assessment.reason;
			record.threatType = assessment.threatType as any;
			record.source = (assessment.threatType === 'spam' ? 'spam_frequency' :
				assessment.threatType === 'homograph' ? 'homograph' :
				assessment.threatType === 'userinfo_obfuscation' ? 'userinfo' : 'reputation') as LinkFlagSource;
			record.userId = context?.userId ?? null;
			record.noteId = context?.noteId ?? null;
			record.resolved = false;
			record.createdAt = now;
			record.updatedAt = now;

			await this.flaggedLinksRepository.save(record);
		} catch {
			// Fail open on audit persistence errors so user experience is not blocked
		}
	}

	public async getFlaggedLinks(options?: {
		limit?: number;
		sinceId?: string;
		untilId?: string;
		unresolvedOnly?: boolean;
	}): Promise<MiFlaggedLink[]> {
		if (!this.flaggedLinksRepository) return [];

		const query = this.flaggedLinksRepository.createQueryBuilder('flag')
			.orderBy('flag.createdAt', 'DESC')
			.take(Math.min(options?.limit ?? 30, 100));

		if (options?.unresolvedOnly) {
			query.andWhere('flag.resolved = false');
		}

		if (options?.sinceId) {
			query.andWhere('flag.id > :sinceId', { sinceId: options.sinceId });
		}

		if (options?.untilId) {
			query.andWhere('flag.id < :untilId', { untilId: options.untilId });
		}

		return await query.getMany();
	}

	public async resolveFlaggedLink(id: string, resolved = true): Promise<boolean> {
		if (!this.flaggedLinksRepository) return false;
		const record = await this.flaggedLinksRepository.findOne({ where: { id } });
		if (!record) return false;
		record.resolved = resolved;
		record.updatedAt = new Date();
		await this.flaggedLinksRepository.save(record);
		return true;
	}

	public updateDomainRule(domain: string, action: 'block' | 'allow' | 'remove'): void {
		if (this.provider instanceof LocalListReputationProvider) {
			if (action === 'block') {
				this.provider.blockDomain(domain);
			} else if (action === 'allow') {
				this.provider.allowDomain(domain);
			} else if (action === 'remove') {
				this.provider.removeDomain(domain);
			}
		}
	}
}
