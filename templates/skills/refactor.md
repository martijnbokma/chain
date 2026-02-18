# Refactor

Perform a safe code refactor: improve readability, structure, DRY, and maintainability without changing functional behavior (unless explicitly requested).

## Purpose

To safely improve code readability, structure, DRY principles, and maintainability without changing functional behavior, following established architectural patterns and best practices.

## When to Use

- The user asks: "refactor", "cleanup", "restructure"
- Reducing duplication (DRY)
- Improving structure (module boundaries, separation of concerns)
- Making code "cleaner" or more idiomatic according to project conventions
- Extracting shared logic and utilities
- Reorganizing code for better maintainability
- Implementing proper architectural patterns

## Constraints

- Never change functional behavior unless explicitly requested
- Always maintain backward compatibility
- Follow project's existing conventions and patterns
- Ensure all tests pass after refactoring
- Keep application working between incremental steps
- Use proper TypeScript types (no `any` types)
- Maintain proper import organization and structure

## Expected Output

- Improved code structure with better separation of concerns
- Reduced duplication through extracted utilities and shared logic
- Cleaner, more readable code following project conventions
- Proper modular architecture with feature and shared modules
- Updated imports and exports following established patterns
- Documentation of architectural decisions and changes
- Verification that all tests and type checking pass

## Core Principles

### 1. SSOT (Single Source of Truth)
- **Principle**: Define data, types, and logic in one place.
- **Implementation**:
  - Types: dedicated type files (e.g., `*.types.ts`, `types/`).
  - Constants/Config: central config files.
  - Styling: use design tokens, not hardcoded values.
- **Anti-pattern**: Creating "convenience copies" of types or interfaces. Refactor the callers instead.

### 2. Modular Architecture
- **Location**:
  - Feature-specific → feature modules (e.g., `src/features/{feature}/`).
  - Cross-feature/generic → shared modules (e.g., `src/shared/`, `src/lib/`).
- **Dependency Rule**: Features should not directly depend on each other (use shared modules or events).
- **Separation of Concerns**:
  1. **Data layer** (services, repositories): Data access, error throwing. No UI or state logic.
  2. **State layer** (hooks, composables, stores): State management, lifecycle, error handling.
  3. **UI layer** (components, views): Rendering, props. No complex business logic.

### 3. DRY (Don't Repeat Yourself)
- If a pattern appears 2+ times → extract to shared utilities or feature-level helpers.
- Normalize naming and structure across the codebase.

## Workflow

### Phase 1: Analysis & Proposal
1. **Inventory**:
   - Identify the goal (e.g., "Extract hook", "Split component", "Remove duplication").
   - Find callers and dependencies.
   - Check what other modules are affected.
2. **Plan**:
   - Determine the new location (feature module vs shared module).
   - Propose the change to the user if it impacts architecture.

### Phase 2: Execution (Iterative)
1. **Step by step**: One mechanical change at a time (Rename, Extract, Move).
2. **Stability**: Keep the application working between steps.
3. **Conventions**:
   - Follow the project's existing export style (named vs default).
   - No `any` types; use proper interfaces or imported types.
   - Keep imports organized (External → Shared → Relative).

### Phase 3: Verification & Quality
Run the project's verification toolchain to ensure integrity:
1. **Typecheck**: Must pass.
2. **Lint**: Must pass.
3. **Tests**: Run relevant tests.
4. **Cleanup**: Remove unused imports/exports and dead code.

## Refactor Patterns

| Pattern | Solution | Location |
|---------|----------|----------|
| **Large component** | Split into Container (data/logic) + Presentational (UI). | Feature components |
| **Data access in UI** | Move to a service/repository. | Feature services |
| **Duplicate logic** | Extract to a hook/composable or utility. | Shared or feature utils |
| **Messy imports** | Organize and group imports consistently. | — |
| **Magic strings/numbers** | Extract to constants or enums. | Constants file |

## Examples

### Extract Component Refactor
**Before:**
```typescript
// Large component with mixed concerns
export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  useEffect(() => {
    fetchUser().then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []);
  
  const handleSave = async (userData) => {
    await updateUser(userData);
    setUser(userData);
    setEditing(false);
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <div className="user-header">
        <h1>{user.name}</h1>
        <button onClick={() => setEditing(true)}>Edit</button>
      </div>
      <div className="user-details">
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone}</p>
      </div>
      {editing && (
        <UserEditForm 
          user={user} 
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}
```

**After:**
```typescript
// Separated data logic
function useUserProfile(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);
  
  return { user, loading, updateUser: async (data) => {
    await updateUser(data);
    setUser(data);
  }};
}

// Separated UI component
function UserProfileHeader({ user, onEdit }) {
  return (
    <div className="user-header">
      <h1>{user.name}</h1>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

// Main component now focused on composition
export default function UserProfile({ userId }) {
  const { user, loading, updateUser } = useUserProfile(userId);
  const [editing, setEditing] = useState(false);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <UserProfileHeader user={user} onEdit={() => setEditing(true)} />
      <UserDetails user={user} />
      {editing && (
        <UserEditForm 
          user={user} 
          onSave={updateUser}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}
```

### Extract Utility Function
**Before:**
```typescript
// Repeated validation logic
function createUserForm(data) {
  if (!data.name || data.name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters');
  }
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  if (!data.password || data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  return { name: data.name.trim(), email: data.email.toLowerCase() };
}

function updateUserForm(data) {
  if (!data.name || data.name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters');
  }
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  return { name: data.name.trim(), email: data.email.toLowerCase() };
}
```

**After:**
```typescript
// Extracted shared validation
function validateUserInput(data) {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!data.email || !data.email.includes('@')) {
    errors.push('Invalid email format');
  }
  if (data.password && data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  return errors;
}

function normalizeUserData(data) {
  return {
    name: data.name.trim(),
    email: data.email.toLowerCase()
  };
}

// Simplified forms using shared utilities
function createUserForm(data) {
  const errors = validateUserInput(data);
  if (errors.length > 0) throw new Error(errors.join(', '));
  
  return normalizeUserData(data);
}

function updateUserForm(data) {
  const errors = validateUserInput(data);
  if (errors.length > 0) throw new Error(errors.join(', '));
  
  return normalizeUserData(data);
}
```
