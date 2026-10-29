/*
 * Copyright 2015-2026 the original author or authors.
 *
 * All rights reserved. This program and the accompanying materials are
 * made available under the terms of the Eclipse Public License v2.0 which
 * accompanies this distribution and is available at
 *
 * https://www.eclipse.org/legal/epl-v20.html
 */

package org.junit.platform.launcher.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.platform.engine.discovery.DiscoverySelectors.selectClass;
import static org.junit.platform.launcher.LauncherConstants.FILTER_POLICY_METHODS_PROPERTY_NAME;
import static org.junit.platform.launcher.LauncherConstants.FILTER_POLICY_MODE_PROPERTY_NAME;
import static org.junit.platform.launcher.LauncherConstants.FILTER_POLICY_TAGS_PROPERTY_NAME;
import static org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder.request;
import static org.junit.platform.launcher.core.LauncherFactoryForTestingPurposesOnly.createLauncher;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.engine.JupiterTestEngine;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.platform.commons.JUnitException;
import org.junit.platform.engine.Filter;
import org.junit.platform.launcher.TagFilter;
import org.junit.platform.launcher.TestIdentifier;
import org.junit.platform.launcher.TestPlan;

/**
 * Acceptance tests for the configurable {@link FilterPolicy} (CH03).
 */
class FilterPolicyTests {

	private static final Set<String> ALL = Set.of("flakyOne()", "fastSmoke()", "fastPlain()", "slowPlain()",
		"inFlakyClass()");

	@Test
	void offOrUnsetIsNoOp() {
		assertThat(testNames(Map.of())).isEqualTo(ALL);
		assertThat(testNames(Map.of(FILTER_POLICY_MODE_PROPERTY_NAME, "off", FILTER_POLICY_TAGS_PROPERTY_NAME,
			"flaky"))).isEqualTo(ALL);
	}

	@Test
	void excludeRemovesMatchedTestsAndPrunesEmptyClasses() {
		var testPlan = discover(Map.of(FILTER_POLICY_MODE_PROPERTY_NAME, "exclude", //
			FILTER_POLICY_TAGS_PROPERTY_NAME, "flaky"));

		assertThat(testNames(testPlan)).containsExactlyInAnyOrder("fastSmoke()", "fastPlain()", "slowPlain()");
		assertThat(allNames(testPlan)).doesNotContain(FlakyClassTestCase.class.getSimpleName());
	}

	@Test
	void tagsAndMethodsAreCombinedWithOr() {
		var names = testNames(Map.of(FILTER_POLICY_MODE_PROPERTY_NAME, "EXCLUDE", //
			FILTER_POLICY_TAGS_PROPERTY_NAME, "flaky", //
			FILTER_POLICY_METHODS_PROPERTY_NAME, ".*#slow.*"));

		assertThat(names).containsExactlyInAnyOrder("fastSmoke()", "fastPlain()");
	}

	@Test
	void onlyKeepsMatchedTests() {
		var names = testNames(Map.of(FILTER_POLICY_MODE_PROPERTY_NAME, "only", //
			FILTER_POLICY_METHODS_PROPERTY_NAME, ".*PolicyTestCase#fast.*"));

		assertThat(names).containsExactlyInAnyOrder("fastSmoke()", "fastPlain()");
	}

	@Test
	void policyNarrowsRequestFiltersAndNeverReincludes() {
		var requestFilter = TagFilter.includeTags("smoke | flaky");
		assertThat(testNames(Map.of(), requestFilter)) // request filter alone
				.containsExactlyInAnyOrder("flakyOne()", "fastSmoke()", "inFlakyClass()");

		var names = testNames(Map.of(FILTER_POLICY_MODE_PROPERTY_NAME, "only", //
			FILTER_POLICY_METHODS_PROPERTY_NAME, ".*#fast.*"), requestFilter);

		// fastPlain() matches the policy but stays excluded by the request filter
		assertThat(names).containsExactly("fastSmoke()");
	}

	@ParameterizedTest
	@CsvSource(delimiter = '|', textBlock = """
			bogus   |           |      | junit.platform.filter.policy.mode
			only    |           |      | junit.platform.filter.policy.mode
			exclude | 'flaky &' |      | junit.platform.filter.policy.tags
			only    |           | '['  | junit.platform.filter.policy.methods
			""")
	void invalidConfigurationFailsDiscoveryNamingTheKey(String mode, String tags, String methods, String key) {
		var params = new java.util.HashMap<String, String>();
		params.put(FILTER_POLICY_MODE_PROPERTY_NAME, mode);
		if (tags != null) {
			params.put(FILTER_POLICY_TAGS_PROPERTY_NAME, tags);
		}
		if (methods != null) {
			params.put(FILTER_POLICY_METHODS_PROPERTY_NAME, methods);
		}

		var exception = assertThrows(JUnitException.class, () -> discover(params));

		assertThat(exception).hasMessageContaining("'" + key + "'");
	}

	private static TestPlan discover(Map<String, String> configurationParameters, Filter<?>... filters) {
		var request = request() //
				.selectors(selectClass(PolicyTestCase.class), selectClass(FlakyClassTestCase.class)) //
				.enableImplicitConfigurationParameters(false) //
				.configurationParameters(configurationParameters) //
				.filters(filters) //
				.build();
		return createLauncher(new JupiterTestEngine()).discover(request);
	}

	private static Set<String> testNames(Map<String, String> configurationParameters, Filter<?>... filters) {
		return testNames(discover(configurationParameters, filters));
	}

	private static Set<String> testNames(TestPlan testPlan) {
		return descendants(testPlan).stream().filter(TestIdentifier::isTest).map(
			TestIdentifier::getDisplayName).collect(Collectors.toSet());
	}

	private static Set<String> allNames(TestPlan testPlan) {
		return descendants(testPlan).stream().map(TestIdentifier::getDisplayName).collect(Collectors.toSet());
	}

	private static Set<TestIdentifier> descendants(TestPlan testPlan) {
		return testPlan.getRoots().stream().flatMap(root -> testPlan.getDescendants(root).stream()).collect(
			Collectors.toSet());
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class PolicyTestCase {

		@Tag("flaky")
		@Test
		void flakyOne() {
		}

		@Tag("smoke")
		@Test
		void fastSmoke() {
		}

		@Test
		void fastPlain() {
		}

		@Test
		void slowPlain() {
		}
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	@Tag("flaky")
	static class FlakyClassTestCase {

		@Test
		void inFlakyClass() {
		}
	}

}
