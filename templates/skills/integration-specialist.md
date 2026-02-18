# Integration Specialist

## Purpose

Universal specialist for multi-system integration across backend, templates, assets, and data flows, providing comprehensive solutions for cross-cutting issues and contract mismatches.

## When to Use

- Cross-cutting issues touching multiple layers
- Contract mismatches between data source and rendering layer
- Build/runtime integration regressions
- Multi-system data flow problems
- Integration testing and validation
- System architecture and boundary issues
- End-to-end integration challenges

## Constraints

- Prefer minimal, testable changes
- Make contracts explicit before fixing symptoms
- Validate end-to-end behavior, not only local fixes
- Maintain system stability during integration changes
- Use proper integration testing strategies
- Consider impact on all affected systems
- Document integration contracts and boundaries

## Execution Steps
1. Classify issue source (data/template/build/runtime/config).
2. Trace contract from source to consumption.
3. Propose minimal remediation path.
4. Validate regression surface.

## Expected Output

- Root-cause analysis + integration-safe change strategy
- Comprehensive integration testing plans
- Contract definitions and validation frameworks
- End-to-end system behavior verification
- Integration regression prevention strategies
- System architecture documentation
- Cross-system communication protocols

## Examples

### Data Contract Integration
```php
// Define explicit data contracts between layers
class UserDataContract {
    public function toApiArray(User $user): array {
        return [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'createdAt' => $user->getCreatedAt()->format('c')
        ];
    }
    
    public function fromApiArray(array $data): User {
        return new User(
            id: $data['id'],
            name: $data['name'],
            email: $data['email'],
            createdAt: new DateTime($data['createdAt'])
        );
    }
}
```

### Build Integration Validation
```javascript
// Validate build integration across systems
class BuildIntegrationValidator {
    validateAssetIntegration() {
        // Check CSS/JS bundle integration
        const cssIntegrity = this.validateCssBundles();
        const jsIntegrity = this.validateJsBundles();
        const assetPaths = this.validateAssetPaths();
        
        return { cssIntegrity, jsIntegrity, assetPaths };
    }
}

## Validation Checklist
- Root cause is reproducible.
- Contracts are explicit and consistent.
- Build and runtime paths both pass.
- Related features are regression-checked.
