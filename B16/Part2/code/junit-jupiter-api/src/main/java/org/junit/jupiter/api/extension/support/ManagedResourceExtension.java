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
import static org.junit.platform.commons.util.ExceptionUtils.throwAsUncheckedException;

import java.lang.reflect.Method;

import org.apiguardian.api.API;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.ExtensionContext.Namespace;
import org.junit.jupiter.api.extension.ExtensionContext.Store;
import org.junit.jupiter.api.extension.ParameterContext;
import org.junit.jupiter.api.extension.ParameterResolutionException;
import org.junit.jupiter.api.extension.ParameterResolver;
import org.junit.platform.commons.support.ReflectionSupport;

/**
 * {@link ParameterResolver} behind {@link ManagedResource @ManagedResource}.
 * Registered by the annotation itself; there is no need to use it directly.
 *
 * <p>Each resource is kept in the {@link Store} of the extension context in
 * which it is first requested, keyed by its factory class, so it is shared
 * within that context and its children and destroyed by the store when that
 * context is closed.
 *
 * @since 6.2
 */
@API(status = EXPERIMENTAL, since = "6.2")
public class ManagedResourceExtension implements ParameterResolver {

	private static final Namespace NAMESPACE = Namespace.create(ManagedResourceExtension.class);

	public ManagedResourceExtension() {
	}

	@Override
	public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {
		return parameterContext.isAnnotated(ManagedResource.class);
	}

	@Override
	public Object resolveParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {
		if (!(parameterContext.getDeclaringExecutable() instanceof Method)) {
			throw new ParameterResolutionException(
				"@ManagedResource is only supported on method parameters, not on " + parameterContext.getParameter()
						+ " of " + parameterContext.getDeclaringExecutable());
		}
		Class<? extends ResourceFactory<?>> factoryType = parameterContext.findAnnotation(
			ManagedResource.class).orElseThrow().value();
		return extensionContext.getStore(NAMESPACE) //
				.computeIfAbsent(factoryType, type -> Holder.create(type, extensionContext), Holder.class) //
				.resource();
	}

	/**
	 * Store value that destroys the resource when the store is closed. Also
	 * implements the deprecated {@code CloseableResource} so it is destroyed
	 * even if closing stored {@code AutoCloseable} values is disabled.
	 */
	@SuppressWarnings({ "deprecation", "try" })
	private record Holder(Object resource, ResourceFactory<Object> factory)
			implements AutoCloseable, Store.CloseableResource {

		@SuppressWarnings("unchecked")
		static Holder create(Class<? extends ResourceFactory<?>> factoryType, ExtensionContext context) {
			var factory = (ResourceFactory<Object>) ReflectionSupport.newInstance(factoryType);
			Object resource;
			try {
				resource = factory.create(context);
			}
			catch (Exception ex) {
				throw throwAsUncheckedException(ex);
			}
			if (resource == null) {
				throw new ParameterResolutionException(factoryType.getName() + ".create() returned null");
			}
			return new Holder(resource, factory);
		}

		@Override
		public void close() throws Exception {
			this.factory.destroy(this.resource);
		}
	}

}
