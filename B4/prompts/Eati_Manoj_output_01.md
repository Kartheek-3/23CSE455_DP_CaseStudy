# Advanced-filtering output

`PropertySpecification` is the common rule interface. Atomic specifications encapsulate individual predicates and `AndSpecification` composes them. `PropertyFilterService::matching` accepts the abstraction; `PropertyController` builds address, maximum-rent, and status specifications from request inputs. The shared five-rule fixture returns only property id 1.
