/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, beforeEach, test, expect, vi } from 'vitest';
import {
	LinkSafetyService,
	type LinkRiskAssessment,
} from '@/core/security/LinkSafetyService.js';
import {
	LocalListReputationProvider,
	MockReputationProvider,
	DisabledReputationProvider,
} from '@/core/security/LinkReputationProvider.js';
import type { FlaggedLinksRepository, AbuseUserReportsRepository } from '@/models/_.js';
import { MiFlaggedLink } from '@/models/FlaggedLink.js';
import { IdService } from '@/core/IdService.js';

describe('LinkSafetyService (CH03)', () => {
	let service: LinkSafetyService;
	let flaggedLinksStore: Map<string, MiFlaggedLink>;
	let flaggedLinksRepoMock: Partial<FlaggedLinksRepository>;
	let abuseReportsRepoMock: Partial<AbuseUserReportsRepository>;
	let idServiceMock: Partial<IdService>;

	let idCounter = 1;

	beforeEach(() => {
		flaggedLinksStore = new Map();
		idCounter = 1;

		flaggedLinksRepoMock = {
			findOne: vi.fn(async (options: any) => {
				const where = options?.where ?? {};
				for (const item of flaggedLinksStore.values()) {
					if (where.id && item.id === where.id) return item;
					if (where.canonicalUrl && item.canonicalUrl === where.canonicalUrl) return item;
				}
				return null;
			}),
			save: vi.fn(async (entity: any) => {
				if (!entity.id) {
					entity.id = `flag_${idCounter++}`;
				}
				flaggedLinksStore.set(entity.id, entity);
				return entity;
			}),
			createQueryBuilder: vi.fn(() => {
				const query: any = {
					orderBy: vi.fn().mockReturnThis(),
					take: vi.fn().mockReturnThis(),
					andWhere: vi.fn().mockReturnThis(),
					getMany: vi.fn(async () => Array.from(flaggedLinksStore.values())),
				};
				return query;
			}),
		};

		abuseReportsRepoMock = {
			find: vi.fn(async () => []),
		};

		idServiceMock = {
			generate: vi.fn(() => `flag_${idCounter++}`),
		};

		service = new LinkSafetyService(
			flaggedLinksRepoMock as FlaggedLinksRepository,
			abuseReportsRepoMock as AbuseUserReportsRepository,
			idServiceMock as IdService,
			new LocalListReputationProvider(),
		);
	});

	describe('13.1 URL syntax and normalisation', () => {
		test('normalises benign HTTP and HTTPS URLs', () => {
			const norm1 = service.normalizeUrl('https://example.com/blog/article');
			expect(norm1).not.toBeNull();
			expect(norm1?.canonical).toBe('https://example.com/blog/article');
			expect(norm1?.hostname).toBe('example.com');

			const norm2 = service.normalizeUrl('http://example.org/test');
			expect(norm2).not.toBeNull();
			expect(norm2?.protocol).toBe('http:');
		});

		test('normalises hostname to lowercase and strips trailing dot', () => {
			const norm = service.normalizeUrl('HTTPS://ExAmPle.cOM./path');
			expect(norm).not.toBeNull();
			expect(norm?.hostname).toBe('example.com');
			expect(norm?.canonical).toBe('https://example.com/path');
		});

		test('strips default ports 80 (http) and 443 (https) while preserving non-default ports', () => {
			const httpDefault = service.normalizeUrl('http://example.com:80/page');
			expect(httpDefault?.canonical).toBe('http://example.com/page');

			const httpsDefault = service.normalizeUrl('https://example.com:443/page');
			expect(httpsDefault?.canonical).toBe('https://example.com/page');

			const customPort = service.normalizeUrl('https://example.com:8443/page');
			expect(customPort?.canonical).toBe('https://example.com:8443/page');
		});

		test('detects embedded userinfo in URLs', () => {
			const withUser = service.normalizeUrl('https://admin:secret@example.com/dashboard');
			expect(withUser).not.toBeNull();
			expect(withUser?.hasUserInfo).toBe(true);
			expect(withUser?.userInfo).toBe('admin:secret');
		});

		test('rejects unsupported or dangerous schemes', async () => {
			const jsUrl = service.normalizeUrl('javascript:alert(1)');
			expect(jsUrl).toBeNull();

			const fileUrl = service.normalizeUrl('file:///etc/passwd');
			expect(fileUrl).toBeNull();

			const ftpUrl = service.normalizeUrl('ftp://ftp.example.com/file');
			expect(ftpUrl).toBeNull();

			const checkResult = await service.checkUrl('javascript:alert(1)');
			expect(checkResult.category).toBe('suspicious');
			expect(checkResult.reason).toContain('unsupported scheme');
		});

		test('handles internationalised and Punycode hostnames', () => {
			const puny = service.normalizeUrl('https://xn--e1afmkfd.xn--p1ai/test');
			expect(puny).not.toBeNull();
			expect(puny?.isPunycode).toBe(true);
		});
	});

	describe('13.2 SSRF and destination safety safeguards', () => {
		test('prohibits IPv4 loopback destinations', () => {
			expect(service.validateDestinationSafety('127.0.0.1').safe).toBe(false);
			expect(service.validateDestinationSafety('127.0.10.1').safe).toBe(false);
			expect(service.validateDestinationSafety('http://127.0.0.1:8080/admin').safe).toBe(false);
		});

		test('prohibits RFC1918 private IPv4 networks', () => {
			expect(service.validateDestinationSafety('10.0.0.1').safe).toBe(false);
			expect(service.validateDestinationSafety('172.16.5.10').safe).toBe(false);
			expect(service.validateDestinationSafety('192.168.1.1').safe).toBe(false);
		});

		test('prohibits link-local, carrier-grade NAT, and multicast destinations', () => {
			expect(service.validateDestinationSafety('169.254.1.1').safe).toBe(false);
			expect(service.validateDestinationSafety('100.64.0.1').safe).toBe(false);
			expect(service.validateDestinationSafety('224.0.0.1').safe).toBe(false);
		});

		test('prohibits IPv6 loopback and IPv4-mapped IPv6 loopback', () => {
			expect(service.validateDestinationSafety('::1').safe).toBe(false);
			expect(service.validateDestinationSafety('::ffff:127.0.0.1').safe).toBe(false);
			expect(service.validateDestinationSafety('::ffff:192.168.1.1').safe).toBe(false);
		});

		test('prohibits localhost and local hostnames', () => {
			expect(service.validateDestinationSafety('localhost').safe).toBe(false);
			expect(service.validateDestinationSafety('internal.localhost').safe).toBe(false);
			expect(service.validateDestinationSafety('router.local').safe).toBe(false);
		});

		test('allows valid public unicast IP addresses', () => {
			expect(service.validateDestinationSafety('93.184.216.34').safe).toBe(true);
		});

		test('marks SSRF attempt as malicious when checked via checkUrl', async () => {
			const res = await service.checkUrl('http://127.0.0.1/internal/secrets');
			expect(res.category).toBe('malicious');
			expect(res.provider).toBe('ssrf-guard');
			expect(res.reason).toContain('prohibited range');
		});
	});

	describe('13.3 Homograph / confusable domain detection', () => {
		test('flags Cyrillic homoglyph lookalikes imitating protected domains', () => {
			// 'gооgle.com' with Cyrillic 'о' (U+043E)
			const cyrillicGoogle = service.normalizeUrl('https://gооgle.com/login');
			expect(cyrillicGoogle).not.toBeNull();

			const detected = service.detectHomographs(cyrillicGoogle!);
			expect(detected.isHomograph).toBe(true);
			expect(detected.matchedDomain).toBe('google.com');
		});

		test('flags lookalikes imitating paypal.com', () => {
			// 'раypal.com' with Cyrillic 'р' (U+0440) and 'а' (U+0430)
			const fakePaypal = service.normalizeUrl('https://раypal.com/verify');
			expect(fakePaypal).not.toBeNull();

			const detected = service.detectHomographs(fakePaypal!);
			expect(detected.isHomograph).toBe(true);
			expect(detected.matchedDomain).toBe('paypal.com');
		});

		test('does not flag genuine protected domain', () => {
			const genuine = service.normalizeUrl('https://google.com/search');
			expect(genuine).not.toBeNull();

			const detected = service.detectHomographs(genuine!);
			expect(detected.isHomograph).toBe(false);
		});
	});

	describe('13.4 Reputation provider strategy and caching', () => {
		test('LocalListReputationProvider returns benign for allowlisted domain', async () => {
			const res = await service.checkUrl('https://github.com/misskey-dev/misskey');
			expect(res.category).toBe('benign');
			expect(res.provider).toBe('local-reputation-list');
		});

		test('LocalListReputationProvider returns malicious for blocklisted domain', async () => {
			const res = await service.checkUrl('https://malware-test.example.com/bad.exe');
			expect(res.category).toBe('malicious');
			expect(res.threatType).toBe('reputation_blocklist');
		});

		test('LocalListReputationProvider returns suspicious for known URL shortener', async () => {
			const res = await service.checkUrl('https://bit.ly/abcdef');
			expect(res.category).toBe('suspicious');
			expect(res.threatType).toBe('shortener');
			expect(res.reason).toContain('URL shortener');
		});

		test('MockReputationProvider returns deterministic verdicts', async () => {
			const mockProvider = new MockReputationProvider();
			mockProvider.setVerdict('custom-phish.net', {
				category: 'malicious',
				threatType: 'phishing',
				reason: 'Verified credential phishing simulation',
			});

			service.setProvider(mockProvider);
			const res = await service.checkUrl('https://custom-phish.net/login');
			expect(res.category).toBe('malicious');
			expect(res.threatType).toBe('phishing');
			expect(res.provider).toBe('mock-reputation-provider');
		});

		test('handles provider failure gracefully without falsely labelling safe or malicious', async () => {
			const mockProvider = new MockReputationProvider();
			mockProvider.setShouldThrow(true, new Error('Network timeout'));
			service.setProvider(mockProvider);

			const res = await service.checkUrl('https://some-unseen-site.org/page');
			expect(res.category).toBe('unknown');
			expect(res.reason).toContain('Reputation provider failed: Network timeout');
			expect(res.confidence).toBe(0.0);
		});

		test('DisabledReputationProvider returns unknown', async () => {
			service.setProvider(new DisabledReputationProvider());
			const res = await service.checkUrl('https://example.org/test');
			expect(res.category).toBe('unknown');
			expect(res.reason).toContain('disabled');
		});

		test('caches positive verdict and avoids duplicate lookups', async () => {
			const mockProvider = new MockReputationProvider();
			const classifySpy = vi.spyOn(mockProvider, 'classify');
			mockProvider.setVerdict('https://cached-safe.org/page', {
				category: 'benign',
				reason: 'Cached test verdict',
			});

			service.setProvider(mockProvider);

			// First check
			const res1 = await service.checkUrl('https://cached-safe.org/page');
			expect(res1.category).toBe('benign');
			expect(classifySpy).toHaveBeenCalledTimes(1);

			// Second check should hit cache
			const res2 = await service.checkUrl('https://cached-safe.org/page');
			expect(res2.category).toBe('benign');
			expect(classifySpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('13.5 Spam and repeated promotional-pattern analysis', () => {
		test('flags repeated identical URL posting within 5 minutes', async () => {
			const userId = 'spammer_123';
			const testUrl = 'https://promo-affiliate.com/deal';

			// Normal initial post: unknown or benign, recorded
			const res1 = await service.checkUrl(testUrl, { userId });
			expect(res1.threatType).not.toBe('spam');

			// Second post within interval
			const res2 = await service.checkUrl(testUrl, { userId });
			expect(res2.threatType).not.toBe('spam');

			// Third post of exact same link within interval -> flags suspicious spam
			const res3 = await service.checkUrl(testUrl, { userId });
			expect(res3.category).toBe('suspicious');
			expect(res3.threatType).toBe('spam');
			expect(res3.reason).toContain('Repeated promotional posting');
		});

		test('flags high-frequency link bursts to the same domain within 10 minutes', async () => {
			const userId = 'domain_spammer';

			// Post 4 different links to same domain
			await service.checkUrl('https://promo-burst.com/page1', { userId });
			await service.checkUrl('https://promo-burst.com/page2', { userId });
			await service.checkUrl('https://promo-burst.com/page3', { userId });
			await service.checkUrl('https://promo-burst.com/page4', { userId });

			// 5th post to same domain triggers burst warning
			const res5 = await service.checkUrl('https://promo-burst.com/page5', { userId });
			expect(res5.category).toBe('suspicious');
			expect(res5.threatType).toBe('spam');
			expect(res5.reason).toContain('High-frequency link bursts');
		});

		test('deduplicates abuse reports to prevent coordinated manipulation', async () => {
			const fakeDomain = 'reported-site.org';

			// 5 reports, but all by same malicious reporter 'bad_actor'
			const duplicateReports = [
				{ id: '1', reporterId: 'bad_actor', comment: `Abuse on ${fakeDomain}`, createdAt: new Date() },
				{ id: '2', reporterId: 'bad_actor', comment: `More abuse on ${fakeDomain}`, createdAt: new Date() },
				{ id: '3', reporterId: 'bad_actor', comment: `Third report ${fakeDomain}`, createdAt: new Date() },
				{ id: '4', reporterId: 'bad_actor', comment: `Fourth report ${fakeDomain}`, createdAt: new Date() },
				{ id: '5', reporterId: 'bad_actor', comment: `Fifth report ${fakeDomain}`, createdAt: new Date() },
			];

			abuseReportsRepoMock.find = vi.fn(async () => duplicateReports as any);

			const check = await service.checkAbuseReportsForDomain(fakeDomain);
			// Unique reporters = 1, threshold of 3 independent reporters not met
			expect(check.reported).toBe(false);
			expect(check.count).toBe(1);

			// Now 3 distinct independent reporters
			const independentReports = [
				{ id: '1', reporterId: 'user_a', comment: `Abuse on ${fakeDomain}`, createdAt: new Date() },
				{ id: '2', reporterId: 'user_b', comment: `Spam on ${fakeDomain}`, createdAt: new Date() },
				{ id: '3', reporterId: 'user_c', comment: `Phishing on ${fakeDomain}`, createdAt: new Date() },
			];

			abuseReportsRepoMock.find = vi.fn(async () => independentReports as any);
			const check2 = await service.checkAbuseReportsForDomain(fakeDomain);
			expect(check2.reported).toBe(true);
			expect(check2.count).toBe(3);
			expect(check2.reason).toContain('3 independent abuse reports');
		});
	});

	describe('13.6 Post text scanning and admin review', () => {
		test('extracts and checks multiple URLs from post text', async () => {
			const text = 'Check out https://github.com and also http://127.0.0.1:3000/internal for details';
			const results = await service.checkText(text);

			expect(results).toHaveLength(2);
			const githubResult = results.find(r => r.domain === 'github.com');
			const ssrfResult = results.find(r => r.domain === '127.0.0.1');

			expect(githubResult?.category).toBe('benign');
			expect(ssrfResult?.category).toBe('malicious');
		});

		test('persists flagged link audit records and allows admin review and resolution', async () => {
			// Trigger a flag
			await service.checkUrl('https://malware-test.example.com/trojan');

			expect(flaggedLinksStore.size).toBeGreaterThanOrEqual(1);
			const storedList = await service.getFlaggedLinks();
			expect(storedList).toHaveLength(1);
			expect(storedList[0].domain).toBe('malware-test.example.com');
			expect(storedList[0].resolved).toBe(false);

			// Admin resolves the flagged link
			const resolved = await service.resolveFlaggedLink(storedList[0].id, true);
			expect(resolved).toBe(true);
			expect(flaggedLinksStore.get(storedList[0].id)?.resolved).toBe(true);
		});

		test('admin can dynamically update domain rules', async () => {
			service.updateDomainRule('custom-blocked.com', 'block');
			const res1 = await service.checkUrl('https://custom-blocked.com/bad');
			expect(res1.category).toBe('malicious');

			service.updateDomainRule('custom-blocked.com', 'allow');
			service.clearCache();
			const res2 = await service.checkUrl('https://custom-blocked.com/bad');
			expect(res2.category).toBe('benign');
		});
	});
});
