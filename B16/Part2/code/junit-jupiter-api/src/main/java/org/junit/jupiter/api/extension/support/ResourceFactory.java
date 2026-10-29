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

import static org.apiguardian.api.API.Status.EXPERIMENTAL;

import org.apiguardian.api.API;
import org.junit.jupiter.api.extension.ExtensionContext;

/**
 * Creates and destroys one kind of resource for {@link ManagedResource @ManagedResource}
 * parameters.
 *
 * <p>Implementations must have a no-argument constructor. A new factory
 * instance is created for each resource.
 *
 * @param <T> the type of resource
 * @since 6.2
 * @see ManagedResource
 */
@API(status = EXPERIMENTAL, since = "6.2")
public interface ResourceFactory<T> {

	/**
	 * Create the resource.
	 *
	 * @param context the extension context in which the resource is first
	 * requested; never {@code null}
	 * @return the resource; never {@code null}
	 */
	T create(ExtensionContext context) throws Exception;

	/**
	 * Destroy the resource when its extension context is closed.
	 *
	 * <p>The default implementation closes the resource if it is
	 * {@link AutoCloseable} and does nothing otherwise.
	 */
	default void destroy(T resource) throws Exception {
		if (resource instanceof AutoCloseable closeable) {
			closeable.close();
		}
	}

}
