/*
 * Copyright 2015-2026 the original author or authors.
 *
 * All rights reserved. This program and the accompanying materials are
 * made available under the terms of the Eclipse Public License v2.0 which
 * accompanies this distribution and is available at
 *
 * https://www.eclipse.org/legal/epl-v20.html
 */

package org.junit.jupiter.api.extension.support;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.fail;
import static org.junit.jupiter.api.Constants.CLOSING_STORED_AUTO_CLOSEABLE_ENABLED_PROPERTY_NAME;
import static org.junit.platform.engine.discovery.DiscoverySelectors.selectClass;
import static org.junit.platform.testkit.engine.EventConditions.event;
import static org.junit.platform.testkit.engine.EventConditions.finishedWithFailure;
import static org.junit.platform.testkit.engine.EventConditions.test;
import static org.junit.platform.testkit.engine.TestExecutionResultConditions.instanceOf;
import static org.junit.platform.testkit.engine.TestExecutionResultConditions.message;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.ParameterResolutionException;
import org.junit.jupiter.engine.AbstractJupiterTestEngineTests;
import org.opentest4j.AssertionFailedError;

/**
 * Acceptance tests for {@link ManagedResource} (CH02).
 */
class ManagedResourceTests extends AbstractJupiterTestEngineTests {

	static final List<String> events = new CopyOnWriteArrayList<>();
	static final AtomicInteger ids = new AtomicInteger();

	@BeforeEach
	void reset() {
		events.clear();
		ids.set(0);
	}

	@Test
	void oneResourcePerTestSharedWithBeforeEachAndDestroyedAfterAfterEach() {
		executeTestsForClass(PerTestTestCase.class).testEvents().assertStatistics(stats -> stats.succeeded(2));

		assertThat(events).containsExactly( //
			"create 1", "beforeEach 1", "test 1", "afterEach", "destroy 1", //
			"create 2", "beforeEach 2", "test 2", "afterEach", "destroy 2");
	}

	@Test
	void resourceRequestedInBeforeAllIsSharedByTheClassAndDestroyedAfterAfterAll() {
		executeTestsForClass(ClassScopeTestCase.class).testEvents().assertStatistics(stats -> stats.succeeded(2));

		assertThat(events).containsExactly("create 1", "beforeAll 1", "test 1", "test 1", "afterAll", "destroy 1");
	}

	@Test
	void resourceIsDestroyedWhenTheTestFailsAndTheOriginalFailureIsReported() {
		var results = executeTestsForClass(FailingTestCase.class);

		results.testEvents().assertThatEvents().haveExactly(1,
			event(test("fails"), finishedWithFailure(instanceOf(AssertionFailedError.class), message("boom"))));
		assertThat(events).containsExactly("create 1", "destroy 1");
	}

	@Test
	void failingCreateFailsTheTestAndNothingIsDestroyed() {
		var results = executeTestsForClass(CreateFailsTestCase.class);

		results.testEvents().assertThatEvents().haveExactly(1, event(test("usesResource"),
			finishedWithFailure(instanceOf(ParameterResolutionException.class), message(m -> m.contains("no db")))));
		assertThat(events).isEmpty();
	}

	@Test
	void failingDestroyFailsTheTestThatOwnedTheResource() {
		var results = executeTestsForClass(DestroyFailsTestCase.class);

		results.testEvents().assertStatistics(stats -> stats.failed(1));
		var failure = results.testEvents().failed().list().getFirst().getRequiredPayload(
			org.junit.platform.engine.TestExecutionResult.class).getThrowable().orElseThrow();
		assertThat(failure).hasRootCauseMessage("cannot stop server");
	}

	@Test
	void invalidUsageIsReportedAsParameterResolutionException() {
		var results = executeTestsForClass(InvalidUsageTestCase.class);

		results.testEvents().assertThatEvents() //
				.haveExactly(1, event(test("noDefaultConstructor"), finishedWithFailure(
					instanceOf(ParameterResolutionException.class)))) //
				.haveExactly(1, event(test("wrongType"), finishedWithFailure(
					instanceOf(ParameterResolutionException.class), message(m -> m.contains("wrongType"))))) //
				.haveExactly(1, event(test("nullResource"), finishedWithFailure(
					instanceOf(ParameterResolutionException.class), message(m -> m.contains("returned null")))));
		executeTestsForClass(ConstructorTestCase.class).testEvents().assertThatEvents() //
				.haveExactly(1, event(test("test"), finishedWithFailure(instanceOf(ParameterResolutionException.class),
					message(m -> m.contains("only supported on method parameters")))));
	}

	@Test
	void resourceIsDestroyedEvenWhenClosingStoredAutoCloseablesIsDisabled() {
		executeTests(request -> request.selectors(selectClass(PerTestTestCase.class)) //
				.configurationParameter(CLOSING_STORED_AUTO_CLOSEABLE_ENABLED_PROPERTY_NAME, "false")) //
						.testEvents().assertStatistics(stats -> stats.succeeded(2));

		assertThat(events).contains("destroy 1", "destroy 2");
	}

	// --- resources and factories used by the fixtures

	record Resource(int id) {
	}

	static class CountingFactory implements ResourceFactory<Resource> {

		@Override
		public Resource create(ExtensionContext context) {
			var resource = new Resource(ids.incrementAndGet());
			events.add("create " + resource.id());
			return resource;
		}

		@Override
		public void destroy(Resource resource) {
			events.add("destroy " + resource.id());
		}
	}

	static class CreateFailsFactory implements ResourceFactory<Resource> {

		@Override
		public Resource create(ExtensionContext context) throws Exception {
			throw new IllegalStateException("no db");
		}

		@Override
		public void destroy(Resource resource) {
			events.add("destroy");
		}
	}

	static class DestroyFailsFactory implements ResourceFactory<Resource> {

		@Override
		public Resource create(ExtensionContext context) {
			return new Resource(1);
		}

		@Override
		public void destroy(Resource resource) {
			throw new IllegalStateException("cannot stop server");
		}
	}

	static class NoDefaultConstructorFactory extends CountingFactory {

		NoDefaultConstructorFactory(String unused) {
		}
	}

	static class NullFactory implements ResourceFactory<Resource> {

		@SuppressWarnings("NullAway")
		@Override
		public Resource create(ExtensionContext context) {
			return null;
		}
	}

	// --- fixtures

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class PerTestTestCase {

		Resource fromBeforeEach;

		@BeforeEach
		void beforeEach(@ManagedResource(CountingFactory.class) Resource resource) {
			fromBeforeEach = resource;
			events.add("beforeEach " + resource.id());
		}

		@Test
		void first(@ManagedResource(CountingFactory.class) Resource resource) {
			assertSame(fromBeforeEach, resource);
			events.add("test " + resource.id());
		}

		@Test
		void second(@ManagedResource(CountingFactory.class) Resource resource) {
			assertSame(fromBeforeEach, resource);
			events.add("test " + resource.id());
		}

		@AfterEach
		void afterEach() {
			events.add("afterEach");
		}
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class ClassScopeTestCase {

		@BeforeAll
		static void beforeAll(@ManagedResource(CountingFactory.class) Resource resource) {
			events.add("beforeAll " + resource.id());
		}

		@Test
		void first(@ManagedResource(CountingFactory.class) Resource resource) {
			events.add("test " + resource.id());
		}

		@Test
		void second(@ManagedResource(CountingFactory.class) Resource resource) {
			events.add("test " + resource.id());
		}

		@AfterAll
		static void afterAll() {
			events.add("afterAll");
		}
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class FailingTestCase {

		@Test
		void fails(@ManagedResource(CountingFactory.class) Resource resource) {
			fail("boom");
		}
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class CreateFailsTestCase {

		@Test
		void usesResource(@ManagedResource(CreateFailsFactory.class) Resource resource) {
		}
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class DestroyFailsTestCase {

		@Test
		void usesResource(@ManagedResource(DestroyFailsFactory.class) Resource resource) {
		}
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class InvalidUsageTestCase {

		@Test
		void noDefaultConstructor(@ManagedResource(NoDefaultConstructorFactory.class) Resource resource) {
		}

		@Test
		void wrongType(@ManagedResource(CountingFactory.class) String resource) {
		}

		@Test
		void nullResource(@ManagedResource(NullFactory.class) Resource resource) {
		}
	}

	@SuppressWarnings("JUnitMalformedDeclaration")
	static class ConstructorTestCase {

		ConstructorTestCase(@ManagedResource(CountingFactory.class) Resource resource) {
		}

		@Test
		void test() {
		}
	}

}
