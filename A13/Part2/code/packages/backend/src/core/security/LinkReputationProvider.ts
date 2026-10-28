/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface NormalizedUrl {
	raw: string;
	canonical: string;
	protocol: string;
	hostname: string;
	port: string;
	pathname: string;
	search: string;
	hasUserInfo: boolean;
	userInfo?: string;
	isIp: boolean;
	ipAddress?: string;
	isPunycode: boolean;
	unicodeHostname: string;
}

export type LinkRiskCategory = 'malicious' | 'suspicious' | 'benign' | 'unknown';

export type LinkThreatType =
	| 'phishing'
	| 'malware'
	| 'spam'
	| 'shortener'
	| 'homograph'
	| 'userinfo_obfuscation'
	| 'ip_direct'
	| 'reputation_blocklist'
	| 'none';

export interface LinkReputationResult {
	category: LinkRiskCategory;
	threatType: LinkThreatType;
	reason: string;
	confidence: number;
	provider: string;
}

/**
 * Strategy pattern interface for link reputation intelligence providers.
 */
export interface LinkReputationProvider {
	readonly name: string;
	classify(target: NormalizedUrl): Promise<LinkReputationResult>;
}

/**
 * Local administrator-configurable list provider with known shorteners and rules.
 */
export class LocalListReputationProvider implements LinkReputationProvider {
	public readonly name = 'local-reputation-list';

	private blockedDomains = new Set<string>([
		'malware-test.example.com',
		'phishing-test.example.com',
		'evil-spam-site.net',
	]);

	private allowedDomains = new Set<string>([
		'misskey.io',
		'github.com',
		'wikipedia.org',
	]);

	private knownShorteners = new Set<string>([
		'bit.ly',
		'tinyurl.com',
		't.co',
		'goo.gl',
		'ow.ly',
		'is.gd',
		'buff.ly',
		'adf.ly',
		'cutt.ly',
		'rb.gy',
	]);

	constructor(options?: {
		blockedDomains?: string[];
		allowedDomains?: string[];
		knownShorteners?: string[];
	}) {
		if (options?.blockedDomains) {
			for (const d of options.blockedDomains) this.blockedDomains.add(d.toLowerCase());
		}
		if (options?.allowedDomains) {
			for (const d of options.allowedDomains) this.allowedDomains.add(d.toLowerCase());
		}
		if (options?.knownShorteners) {
			for (const s of options.knownShorteners) this.knownShorteners.add(s.toLowerCase());
		}
	}

	public blockDomain(domain: string): void {
		this.blockedDomains.add(domain.toLowerCase().trim());
		this.allowedDomains.delete(domain.toLowerCase().trim());
	}

	public allowDomain(domain: string): void {
		this.allowedDomains.add(domain.toLowerCase().trim());
		this.blockedDomains.delete(domain.toLowerCase().trim());
	}

	public removeDomain(domain: string): void {
		const d = domain.toLowerCase().trim();
		this.blockedDomains.delete(d);
		this.allowedDomains.delete(d);
	}

	public getBlockedDomains(): string[] {
		return Array.from(this.blockedDomains);
	}

	public getAllowedDomains(): string[] {
		return Array.from(this.allowedDomains);
	}

	public async classify(target: NormalizedUrl): Promise<LinkReputationResult> {
		const host = target.hostname.toLowerCase();
		const unicodeHost = target.unicodeHostname.toLowerCase();

		// Check allowlist first
		if (this.isDomainOrSubdomain(host, this.allowedDomains) || this.isDomainOrSubdomain(unicodeHost, this.allowedDomains)) {
			return {
				category: 'benign',
				threatType: 'none',
				reason: 'Domain is in instance trusted allowlist',
				confidence: 1.0,
				provider: this.name,
			};
		}

		// Check blocklist
		if (this.isDomainOrSubdomain(host, this.blockedDomains) || this.isDomainOrSubdomain(unicodeHost, this.blockedDomains)) {
			return {
				category: 'malicious',
				threatType: 'reputation_blocklist',
				reason: 'Domain is explicitly blocklisted by instance administrator',
				confidence: 1.0,
				provider: this.name,
			};
		}

		// Check URL shorteners
		if (this.knownShorteners.has(host)) {
			return {
				category: 'suspicious',
				threatType: 'shortener',
				reason: `Known URL shortener service (${host}) obscures final destination`,
				confidence: 0.85,
				provider: this.name,
			};
		}

		// Check userinfo obfuscation (e.g. https://google.com@evil.com)
		if (target.hasUserInfo) {
			return {
				category: 'suspicious',
				threatType: 'userinfo_obfuscation',
				reason: 'URL includes misleading credentials before hostname',
				confidence: 0.9,
				provider: this.name,
			};
		}

		// Check bare IP destinations
		if (target.isIp) {
			return {
				category: 'suspicious',
				threatType: 'ip_direct',
				reason: 'Direct numeric IP address destination instead of registered domain',
				confidence: 0.7,
				provider: this.name,
			};
		}

		return {
			category: 'unknown',
			threatType: 'none',
			reason: 'No conclusive threat intelligence available for domain',
			confidence: 0.0,
			provider: this.name,
		};
	}

	private isDomainOrSubdomain(host: string, list: Set<string>): boolean {
		if (list.has(host)) return true;
		const parts = host.split('.');
		for (let i = 1; i < parts.length; i++) {
			const parent = parts.slice(i).join('.');
			if (list.has(parent)) return true;
		}
		return false;
	}
}

/**
 * Deterministic mock reputation provider for automated testing and isolated CI environments.
 */
export class MockReputationProvider implements LinkReputationProvider {
	public readonly name = 'mock-reputation-provider';

	private verdicts = new Map<string, LinkReputationResult>();
	private shouldThrow = false;
	private throwError: Error = new Error('Mock provider connection error');

	public setVerdict(domainOrUrl: string, verdict: Partial<LinkReputationResult> & { category: LinkRiskCategory }): void {
		this.verdicts.set(domainOrUrl.toLowerCase(), {
			category: verdict.category,
			threatType: verdict.threatType ?? 'none',
			reason: verdict.reason ?? `Mock verdict for ${domainOrUrl}`,
			confidence: verdict.confidence ?? 0.9,
			provider: this.name,
		});
	}

	public setShouldThrow(shouldThrow: boolean, error?: Error): void {
		this.shouldThrow = shouldThrow;
		if (error) this.throwError = error;
	}

	public async classify(target: NormalizedUrl): Promise<LinkReputationResult> {
		if (this.shouldThrow) {
			throw this.throwError;
		}

		const directMatch = this.verdicts.get(target.canonical.toLowerCase())
			?? this.verdicts.get(target.raw.toLowerCase())
			?? this.verdicts.get(target.hostname.toLowerCase())
			?? this.verdicts.get(target.unicodeHostname.toLowerCase());

		if (directMatch) {
			return directMatch;
		}

		return {
			category: 'unknown',
			threatType: 'none',
			reason: 'Domain not found in mock provider registry',
			confidence: 0.0,
			provider: this.name,
		};
	}
}

/**
 * Disabled reputation provider for when external lookups are deactivated.
 */
export class DisabledReputationProvider implements LinkReputationProvider {
	public readonly name = 'disabled-reputation-provider';

	public async classify(target: NormalizedUrl): Promise<LinkReputationResult> {
		return {
			category: 'unknown',
			threatType: 'none',
			reason: 'Reputation intelligence checks are currently disabled',
			confidence: 0.0,
			provider: this.name,
		};
	}
}
