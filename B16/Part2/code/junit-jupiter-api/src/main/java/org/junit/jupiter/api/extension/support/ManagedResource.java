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

import static java.lang.annotation.RetentionPolicy.RUNTIME;
import static org.apiguardian.api.API.Status.EXPERIMENTAL;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import org.apiguardian.api.API;
import org.junit.jupiter.api.extension.ExtendWith;

/**
 * Injects a resource created by the given {@link ResourceFactory} into a
 * method parameter and destroys it automatically.
 *
 * <p>The lifetime follows the method that first asks for the resource:
 * <ul>
 * <li>parameter of a {@code @BeforeAll} or {@code @AfterAll} method: one
 * resource per test class, destroyed after the class (including its
 * {@code @Nested} classes) has finished;</li>
 * <li>parameter of a test, {@code @BeforeEach} or {@code @AfterEach} method:
 * one resource per test, destroyed after the test and its
 * {@code @AfterEach} methods.</li>
 * </ul>
 * A test that asks for a factory already used in {@code @BeforeAll} receives
 * the class-wide resource. Constructor parameters are not supported.
 *
 * <pre class="code">
 * class RepositoryTests {
 *     &#64;Test
 *     void saves(&#64;ManagedResource(InMemoryDatabaseFactory.class) DataSource db) { ... }
 * }
 * </pre>
 *
 * @since 6.2
 * @see ResourceFactory
 */
@Target(ElementType.PARAMETER)
@Retention(RUNTIME)
@Documented
@ExtendWith(ManagedResourceExtension.class)
@API(status = EXPERIMENTAL, since = "6.2")
public @interface ManagedResource {

	/**
	 * The factory that creates and destroys the resource.
	 */
	Class<? extends ResourceFactory<?>> value();

}
