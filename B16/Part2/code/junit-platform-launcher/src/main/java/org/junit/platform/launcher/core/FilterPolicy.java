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

import static org.junit.platform.launcher.LauncherConstants.FILTER_POLICY_METHODS_PROPERTY_NAME;
import static org.junit.platform.launcher.LauncherConstants.FILTER_POLICY_MODE_PROPERTY_NAME;
import static org.junit.platform.launcher.LauncherConstants.FILTER_POLICY_TAGS_PROPERTY_NAME;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;

import org.junit.platform.commons.JUnitException;
import org.junit.platform.engine.ConfigurationParameters;
import org.junit.platform.engine.FilterResult;
import org.junit.platform.engine.TestDescriptor;
import org.junit.platform.launcher.MethodFilter;
import org.junit.platform.launcher.PostDiscoveryFilter;
import org.junit.platform.launcher.TagFilter;

/**
 * {@link PostDiscoveryFilter} that is configured entirely through
 * configuration parameters: one set of tests (tag expressions and/or method
 * name patterns) plus a mode that either excludes that set ({@code exclude})
 * or keeps only that set ({@code only}).
 *
 * <p>All values are parsed and validated in {@link #fromConfiguration}, so
 * {@link #apply} never throws.
 *
 * @since 6.2
 * @see org.junit.platform.launcher.LauncherConstants#FILTER_POLICY_MODE_PROPERTY_NAME
 */
final class FilterPolicy implements PostDiscoveryFilter {

	private final boolean exclude;
	private final List<Predicate<TestDescriptor>> matchers;

	/**
	 * Create the policy for the supplied configuration.
	 *
	 * @return empty if the mode is {@code off} or not set
	 * @throws JUnitException if any value is invalid; the message names the
	 * offending configuration parameter
	 */
	static Optional<PostDiscoveryFilter> fromConfiguration(ConfigurationParameters configuration) {
		String mode = configuration.get(FILTER_POLICY_MODE_PROPERTY_NAME) //
				.map(value -> value.strip().toLowerCase(Locale.ROOT)) //
				.orElse("off");
		if (mode.equals("off")) {
			return Optional.empty();
		}
		if (!mode.equals("exclude") && !mode.equals("only")) {
			throw new JUnitException("Invalid value '%s' for configuration parameter '%s': expected off, exclude or only"
					.formatted(mode, FILTER_POLICY_MODE_PROPERTY_NAME));
		}
		List<Predicate<TestDescriptor>> matchers = new ArrayList<>();
		matcher(configuration, FILTER_POLICY_TAGS_PROPERTY_NAME, TagFilter::includeTags).ifPresent(matchers::add);
		matcher(configuration, FILTER_POLICY_METHODS_PROPERTY_NAME, MethodFilter::includeMethodNamePatterns).ifPresent(
			matchers::add);
		if (matchers.isEmpty()) {
			throw new JUnitException("Configuration parameter '%s' is '%s' but neither '%s' nor '%s' is set".formatted(
				FILTER_POLICY_MODE_PROPERTY_NAME, mode, FILTER_POLICY_TAGS_PROPERTY_NAME,
				FILTER_POLICY_METHODS_PROPERTY_NAME));
		}
		return Optional.of(new FilterPolicy(mode.equals("exclude"), matchers));
	}

	// ponytail: values are split on ',', so a method regex cannot itself contain a comma
	private static Optional<Predicate<TestDescriptor>> matcher(ConfigurationParameters configuration, String key,
			Function<List<String>, PostDiscoveryFilter> filterFactory) {
		List<String> values = configuration.get(key) //
				.map(value -> Arrays.stream(value.split(",")).map(String::strip).filter(s -> !s.isEmpty()).toList()) //
				.orElse(List.of());
		if (values.isEmpty()) {
			return Optional.empty();
		}
		try {
			return Optional.of(filterFactory.apply(values).toPredicate());
		}
		catch (RuntimeException ex) {
			throw new JUnitException(
				"Invalid value for configuration parameter '%s': %s".formatted(key, ex.getMessage()), ex);
		}
	}

	private FilterPolicy(boolean exclude, List<Predicate<TestDescriptor>> matchers) {
		this.exclude = exclude;
		this.matchers = matchers;
	}

	@Override
	public FilterResult apply(TestDescriptor descriptor) {
		boolean matches = this.matchers.stream().anyMatch(matcher -> matcher.test(descriptor));
		if (this.exclude) {
			return FilterResult.includedIf(!matches, () -> "not matched by filter policy",
				() -> "excluded by filter policy (mode=exclude)");
		}
		return FilterResult.includedIf(matches, () -> "selected by filter policy (mode=only)",
			() -> "not selected by filter policy (mode=only)");
	}

}
