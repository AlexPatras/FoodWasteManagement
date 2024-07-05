
import {
  ClassDecoratorFactory,
  Constructor,
  DecoratorFactory,
  MetadataInspector,
  MethodDecoratorFactory,
} from '@loopback/core';
import {
  AUTHENTICATION_METADATA_CLASS_KEY,
  AUTHENTICATION_METADATA_KEY,
  AUTHENTICATION_METADATA_METHOD_KEY,
} from '../keys';
import {AuthenticationMetadata} from '../types';

class AuthenticateClassDecoratorFactory extends ClassDecoratorFactory<
  AuthenticationMetadata[]
> {}

/**

 *
 * @param strategies - The names of the authentication strategies to use
 * or authentication metadata objects.
 */
export function authenticate(
  ...strategies: (string | AuthenticationMetadata)[]
) {
  return function authenticateDecoratorForClassOrMethod(
   
    target: any,
    method?: string,
  
   
    methodDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    const specs: AuthenticationMetadata[] = [];

    for (const strategy of strategies) {
      if (typeof strategy === 'object') {
        specs.push(strategy);
      } else {
        specs.push({strategy: strategy});
      }
    }

    if (method && methodDescriptor) {
      // Method
      return MethodDecoratorFactory.createDecorator<AuthenticationMetadata[]>(
        AUTHENTICATION_METADATA_KEY,
        specs,
        {decoratorName: '@authenticate'},
      )(target, method, methodDescriptor);
    }
    if (typeof target === 'function' && !method && !methodDescriptor) {
      // Class
      return AuthenticateClassDecoratorFactory.createDecorator<
        AuthenticationMetadata[]
      >(AUTHENTICATION_METADATA_CLASS_KEY, specs, {
        decoratorName: '@authenticate',
      })(target);
    }
    // Not on a class or method
    throw new Error(
      '@authenticate cannot be used on a property: ' +
        DecoratorFactory.getTargetName(target, method, methodDescriptor),
    );
  };
}

export namespace authenticate {
  /**
   * `@authenticate.skip()` - a sugar decorator to skip authentication
   */
  export const skip = () => authenticate({strategy: '', skip: true});
}

/**
 * Fetch authentication metadata stored by `@authenticate` decorator.
 *
 * @param targetClass - Target controller
 * @param methodName - Target method
 */
export function getAuthenticateMetadata(
  targetClass: Constructor<{}>,
  methodName: string,
): AuthenticationMetadata[] | undefined {
  // First check method level
  let metadata = MetadataInspector.getMethodMetadata<AuthenticationMetadata[]>(
    AUTHENTICATION_METADATA_METHOD_KEY,
    targetClass.prototype,
    methodName,
  );
  if (metadata) return metadata;
  // Check if the class level has `@authenticate`
  metadata = MetadataInspector.getClassMetadata<AuthenticationMetadata[]>(
    AUTHENTICATION_METADATA_CLASS_KEY,
    targetClass,
  );
  return metadata;
}
