/*
 * Copyright 2015-2026 the original author or authors.
 *
 * All rights reserved. This program and the accompanying materials are
 * made available under the terms of the Eclipse Public License v2.0 which
 * accompanies this distribution and is available at
 *
 * https://www.eclipse.org/legal/epl-v20.html
 */

package org.junit.platform.launcher.listeners;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.junit.platform.engine.discovery.DiscoverySelectors.selectClass;
import static org.junit.platform.launcher.LauncherConstants.OUTPUT_DIR_PROPERTY_NAME;
import static org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder.request;
import static org.junit.platform.launcher.listeners.ClassSummaryListener.DEFAULT_OUTPUT_FILE;
import static org.junit.platform.launcher.listeners.ClassSummaryListener.LISTENER_ENABLED_PROPERTY_NAME;
import static org.junit.platform.launcher.listeners.ClassSummaryListener.OUTPUT_FILE_PROPERTY_NAME;
import static org.junit.platform.launcher.listeners.ClassSummaryListener.SLOWEST_PROPERTY_NAME;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.LogRecord;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.fixtures.TrackLogRecords;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.engine.JupiterTestEngine;
import org.junit.platform.commons.logging.LogRecordListener;
import org.junit.platform.launcher.core.LauncherConfig;
import org.junit.platform.launcher.core.LauncherFactory;

/**
 * Acceptance tests for {@link ClassSummaryListener} (CH01). The listener is
 * picked up through the {@code ServiceLoader}, as in a real build.
 */
class ClassSummaryListenerTests {

	@TempDir
	Path outputDir;

	@Test
	void disabledByDefault() {
		var summary = run(Map.of(), MixedTestCase.class);

		assertThat(outputDir.resolve(DEFAULT_OUTPUT_FILE)).doesNotExist();
		assertThat(summary.getTestsFoundCount()).isEqualTo(4);
	}

	@Test
	void writesOneRowPerClassAndTotalsMatchSummaryGeneratingListener() throws Exception {
		var summary = run(Map.of(LISTENER_ENABLED_PROPERTY_NAME, "true"), MixedTestCase.class, TimedTestCase.class);

		var lines = Files.readAllLines(outputDir.resolve(DEFAULT_OUTPUT_FILE));
		assertThat(counts(lines, MixedTestCase.class.getName())).containsExactly(4L, 2L, 1L, 0L, 1L);
		assertThat(counts(lines, TimedTestCase.class.getName())).containsExactly(3L, 3L, 0L, 0L, 0L);
		assertThat(counts(lines, "TOTAL")).containsExactly(summary.getTestsFoundCount(),
			summary.getTestsSucceededCount(), summary.getTestsFailedCount(), summary.getTestsAbortedCount(),
			summary.getTestsSkippedCount());
	}

	@Test
	void listsTheSlowestTestsInDescendingOrder() throws Exception {
		run(Map.of(LISTENER_ENABLED_PROPERTY_NAME, "true", SLOWEST_PROPERTY_NAME, "2"), TimedTestCase.class);

		var text = Files.readString(outputDir.resolve(DEFAULT_OUTPUT_FILE));
		var slowest = text.substring(text.indexOf("Slowest 2 tests")).lines().skip(1).toList();
		assertThat(slowest).hasSize(2);
		assertThat(slowest.get(0)).endsWith("sleeps300ms()");
		assertThat(slowest.get(1)).endsWith("sleeps150ms()");
	}

	@Test
	void invalidSlowestValueIsLoggedAndTheDefaultIsUsed(@TrackLogRecords LogRecordListener logRecords)
			throws Exception {
		var summary = run(Map.of(LISTENER_ENABLED_PROPERTY_NAME, "true", SLOWEST_PROPERTY_NAME, "abc"),
			MixedTestCase.class);

		assertThat(summary.getTestsFailedCount()).isEqualTo(1);
		assertThat(Files.readString(outputDir.resolve(DEFAULT_OUTPUT_FILE))).contains(
			"Slowest " + ClassSummaryListener.DEFAULT_SLOWEST + " tests");
		assertThat(logRecords.stream(ClassSummaryListener.class, Level.WARNING).map(LogRecord::getMessage)) //
				.anyMatch(message -> message.contains("'abc'") && message.contains(SLOWEST_PROPERTY_NAME));
	}

	@Test
	void unwritableOutputFileIsLoggedAndDoesNotAffectTheRun(@TrackLogRecords LogRecordListener logRecords) {
		var summary = run(Map.of(LISTENER_ENABLED_PROPERTY_NAME, "true", OUTPUT_FILE_PROPERTY_NAME,
			"missing-dir/summary.txt"), MixedTestCase.class);

		assertThat(summary.getTestsFoundCount()).isEqualTo(4);
		assertThat(summary.getTestsFailedCount()).isEqualTo(1);
		assertThat(logRecords.stream(ClassSummaryListener.class, Level.SEVERE).map(LogRecord::getMessage)) //
				.anyMatch(message -> message.contains("missing-dir/summary.txt"));
	}

	private TestExecutionSummary run(Map<String, String> configurationParameters, Class<?>... testClasses) {
		var parameters = new HashMap<>(configurationParameters);
		parameters.put(OUTPUT_DIR_PROPERTY_NAME, outputDir.toString());
		var request = request() //
				.selectors(java.util.Arrays.stream(testClasses).map(c -> selectClass(c)).toList()) //
				.enableImplicitConfigurationParameters(false) //
				.configurationParameters(parameters) //
				.build();
		var launcher = LauncherFactory.create(LauncherConfig.builder() //
				.enableTestEngineAutoRegistration(false) //
				.addTestEngines(new JupiterTestEngine()) //
				.build());
		var summaryListener = new SummaryGeneratingListener();
		launcher.execute(request, summaryListener);
		return summaryListener.getSummary();
	}

	/** total, passed, failed, aborted, skipped of the row that starts with {@code name}. */
	private static List<Long> counts(List<String> lines, String name) {
		var row = lines.stream().filter(line -> line.startsWith(name + " ")).findFirst().orElseThrow();
		return java.util.Arrays.stream(row.substring(name.length()).trim().split("\\s+")).limit(5).map(
			Long::valueOf).toList();
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class MixedTestCase {

		@Test
		void passes1() {
		}

		@Test
		void passes2() {
		}

		@Test
		void fails() {
			fail("expected failure");
		}

		@Disabled
		@Test
		void disabled() {
		}
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class TimedTestCase {

		@Test
		void sleeps300ms() throws Exception {
			Thread.sleep(300);
		}

		@Test
		void sleeps150ms() throws Exception {
			Thread.sleep(150);
		}

		@Test
		void noSleep() {
		}
	}

}
