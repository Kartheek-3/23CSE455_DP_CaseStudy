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

import static java.util.Comparator.comparingLong;
import static java.util.stream.Stream.concat;
import static org.apiguardian.api.API.Status.EXPERIMENTAL;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Stream;

import org.apiguardian.api.API;
import org.jspecify.annotations.Nullable;
import org.junit.platform.commons.logging.Logger;
import org.junit.platform.commons.logging.LoggerFactory;
import org.junit.platform.engine.ConfigurationParameters;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.TestSource;
import org.junit.platform.engine.UniqueId;
import org.junit.platform.engine.support.descriptor.ClassSource;
import org.junit.platform.engine.support.descriptor.MethodSource;
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;
import org.junit.platform.launcher.TestPlan;

/**
 * {@link TestExecutionListener} that writes a per-class summary of the test
 * run (total, passed, failed, aborted, skipped and time per class) plus the
 * slowest tests to a text file in the reporting output directory.
 *
 * <p>Registered automatically via the {@link java.util.ServiceLoader} but
 * disabled by default; enable it with
 * {@value #LISTENER_ENABLED_PROPERTY_NAME}{@code =true}. Only tests are
 * counted, not containers. Problems with the configuration or the output file
 * are logged and never affect the test run.
 *
 * @since 6.2
 * @see SummaryGeneratingListener
 */
@API(status = EXPERIMENTAL, since = "6.2")
public class ClassSummaryListener implements TestExecutionListener {

	/**
	 * Property name used to enable the listener: {@value}
	 *
	 * <p>Default: {@code false}
	 */
	public static final String LISTENER_ENABLED_PROPERTY_NAME = "junit.platform.listeners.summary.enabled";

	/**
	 * Property name used to set how many of the slowest tests are listed;
	 * {@code 0} lists none: {@value}
	 *
	 * <p>Default: {@value #DEFAULT_SLOWEST}
	 */
	public static final String SLOWEST_PROPERTY_NAME = "junit.platform.listeners.summary.slowest";

	/**
	 * Property name used to set the name of the summary file, which is created
	 * in the reporting output directory: {@value}
	 *
	 * <p>Default: {@value #DEFAULT_OUTPUT_FILE}
	 */
	public static final String OUTPUT_FILE_PROPERTY_NAME = "junit.platform.listeners.summary.output.file";

	public static final int DEFAULT_SLOWEST = 5;

	public static final String DEFAULT_OUTPUT_FILE = "junit-class-summary.txt";

	private static final String OTHER = "(other)";

	private final Logger logger = LoggerFactory.getLogger(ClassSummaryListener.class);

	private final Map<UniqueId, Long> startNanos = new ConcurrentHashMap<>();
	private final Map<String, Row> rows = new ConcurrentHashMap<>();
	private final Queue<Timing> timings = new ConcurrentLinkedQueue<>();

	private @Nullable TestPlan testPlan;
	private boolean enabled;
	private int slowest = DEFAULT_SLOWEST;

	public ClassSummaryListener() {
	}

	@Override
	public void testPlanExecutionStarted(TestPlan testPlan) {
		ConfigurationParameters configuration = testPlan.getConfigurationParameters();
		this.enabled = configuration.getBoolean(LISTENER_ENABLED_PROPERTY_NAME).orElse(false);
		if (this.enabled) {
			this.testPlan = testPlan;
			this.slowest = readSlowest(configuration);
			this.startNanos.clear();
			this.rows.clear();
			this.timings.clear();
		}
	}

	@Override
	public void executionSkipped(TestIdentifier testIdentifier, String reason) {
		TestPlan testPlan = this.testPlan;
		if (this.enabled && testPlan != null) {
			concat(Stream.of(testIdentifier), testPlan.getDescendants(testIdentifier).stream()) //
					.filter(TestIdentifier::isTest) //
					.forEach(test -> row(test).skipped.incrementAndGet());
		}
	}

	@Override
	public void executionStarted(TestIdentifier testIdentifier) {
		if (this.enabled && testIdentifier.isTest()) {
			this.startNanos.put(testIdentifier.getUniqueIdObject(), System.nanoTime());
		}
	}

	@Override
	public void executionFinished(TestIdentifier testIdentifier, TestExecutionResult testExecutionResult) {
		if (!this.enabled || !testIdentifier.isTest()) {
			return;
		}
		Row row = row(testIdentifier);
		switch (testExecutionResult.getStatus()) {
			case SUCCESSFUL -> row.passed.incrementAndGet();
			case FAILED -> row.failed.incrementAndGet();
			case ABORTED -> row.aborted.incrementAndGet();
		}
		// A missing start time (e.g. an earlier listener call failed) only loses the timing, never the count.
		Long start = this.startNanos.remove(testIdentifier.getUniqueIdObject());
		if (start != null) {
			long nanos = System.nanoTime() - start;
			row.nanos.addAndGet(nanos);
			this.timings.add(new Timing(className(testIdentifier) + " > " + testIdentifier.getDisplayName(), nanos));
		}
	}

	@Override
	public void testPlanExecutionFinished(TestPlan testPlan) {
		if (!this.enabled) {
			return;
		}
		String fileName = testPlan.getConfigurationParameters().get(OUTPUT_FILE_PROPERTY_NAME).orElse(
			DEFAULT_OUTPUT_FILE);
		try {
			Path outputFile = Files.createDirectories(testPlan.getOutputDirectoryCreator().getRootDirectory()).resolve(
				fileName);
			Files.writeString(outputFile, render(), StandardCharsets.UTF_8);
			logger.info(() -> "Class summary written to " + outputFile.toAbsolutePath());
		}
		catch (IOException | RuntimeException ex) {
			logger.error(ex, () -> "Failed to write class summary file '%s'".formatted(fileName));
		}
		this.testPlan = null;
	}

	private int readSlowest(ConfigurationParameters configuration) {
		Optional<String> value = configuration.get(SLOWEST_PROPERTY_NAME);
		if (value.isEmpty()) {
			return DEFAULT_SLOWEST;
		}
		try {
			int slowest = Integer.parseInt(value.get().strip());
			if (slowest >= 0) {
				return slowest;
			}
		}
		catch (NumberFormatException ignored) {
			// fall through to the warning below
		}
		logger.warn(() -> "Invalid value '%s' for configuration parameter '%s'; using default %d".formatted(
			value.get(), SLOWEST_PROPERTY_NAME, DEFAULT_SLOWEST));
		return DEFAULT_SLOWEST;
	}

	private Row row(TestIdentifier test) {
		return this.rows.computeIfAbsent(className(test), __ -> new Row());
	}

	/**
	 * Name of the class a test belongs to: the nearest method or class source
	 * of the test or one of its ancestors, so dynamic tests and invocations are
	 * grouped under their class too.
	 */
	private String className(TestIdentifier test) {
		TestPlan testPlan = this.testPlan;
		Optional<TestIdentifier> current = Optional.of(test);
		while (current.isPresent()) {
			Optional<TestSource> source = current.get().getSource();
			if (source.isPresent() && source.get() instanceof MethodSource methodSource) {
				return methodSource.getClassName();
			}
			if (source.isPresent() && source.get() instanceof ClassSource classSource) {
				return classSource.getClassName();
			}
			current = testPlan == null ? Optional.empty() : testPlan.getParent(current.get());
		}
		return OTHER;
	}

	private String render() {
		var out = new StringBuilder();
		String format = "%-60s %6s %6s %6s %7s %7s %9s%n";
		out.append(format.formatted("CLASS", "TOTAL", "PASSED", "FAILED", "ABORTED", "SKIPPED", "TIME(ms)"));
		var total = new Row();
		new TreeMap<>(this.rows).forEach((className, row) -> {
			out.append(row.format(format, className));
			total.add(row);
		});
		out.append(total.format(format, "TOTAL"));
		if (this.slowest > 0 && !this.timings.isEmpty()) {
			out.append("%nSlowest %d tests%n".formatted(this.slowest));
			this.timings.stream() //
					.sorted(comparingLong(Timing::nanos).reversed()) //
					.limit(this.slowest) //
					.forEach(timing -> out.append("%9d ms  %s%n".formatted(millis(timing.nanos()), timing.name())));
		}
		return out.toString();
	}

	private static long millis(long nanos) {
		return nanos / 1_000_000;
	}

	private record Timing(String name, long nanos) {
	}

	private static final class Row {

		final AtomicLong passed = new AtomicLong();
		final AtomicLong failed = new AtomicLong();
		final AtomicLong aborted = new AtomicLong();
		final AtomicLong skipped = new AtomicLong();
		final AtomicLong nanos = new AtomicLong();

		long total() {
			return passed.get() + failed.get() + aborted.get() + skipped.get();
		}

		void add(Row other) {
			passed.addAndGet(other.passed.get());
			failed.addAndGet(other.failed.get());
			aborted.addAndGet(other.aborted.get());
			skipped.addAndGet(other.skipped.get());
			nanos.addAndGet(other.nanos.get());
		}

		String format(String format, String name) {
			return format.formatted(name, total(), passed.get(), failed.get(), aborted.get(), skipped.get(),
				millis(nanos.get()));
		}
	}

}
