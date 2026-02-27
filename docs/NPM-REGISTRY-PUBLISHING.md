# Chain publiceren naar je eigen npm Registry

Deze handleiding legt uit hoe je Chain naar een **eigen** npm registry kunt uploaden — bijvoorbeeld GitHub Packages, Verdaccio, of een andere private registry.

> Voor publiceren naar de **publieke** npm registry (npmjs.com), zie [PUBLISHING.md](./PUBLISHING.md).

---

## Simpelste manier (nieuwe release)

Als je registry en authenticatie al staan:

```bash
npm version patch
npm publish
```

Of in één regel: `npm version patch && npm publish`

- **patch** → bugfixes (0.1.7 → 0.1.8)
- **minor** → nieuwe features (0.1.7 → 0.2.0)
- **major** → breaking changes (0.1.7 → 1.0.0)

`prepublishOnly` draait automatisch typecheck, tests en build vóór publish.

---

## Overzicht

| Registry type | Voorbeeld URL | Gebruik |
|---------------|---------------|---------|
| GitHub Packages | `https://npm.pkg.github.com` | Packages bij GitHub-repo's |
| Verdaccio | `http://localhost:4873` | Zelf-gehoste private registry |
| npm Enterprise | `https://registry.npmjs.org` (of eigen URL) | Bedrijfs-npm |
| Artifactory / Nexus | Eigen URL | Enterprise package management |

---

## Stap 1: Package voorbereiden

### Scope aanpassen (optioneel)

Je kunt de scope aanpassen als je wilt; hieronder gebruiken we `@silverfox14/chain` als voorbeeld.

### publishConfig in package.json

Voeg `publishConfig` toe om de registry te specificeren:

```json
{
  "name": "@silverfox14/chain",
  "publishConfig": {
    "registry": "https://jouw-registry-url.com",
    "access": "public"
  }
}
```

- **registry** — URL van je npm registry
- **access** — `public` of `restricted` (voor private packages)

---

## Stap 2: .npmrc configureren

Maak een `.npmrc` bestand in de projectroot (of gebruik `~/.npmrc` voor globaal).

### Optie A: Project-specifiek (.npmrc in repo)

```ini
# .npmrc (in /chain projectroot)
registry=https://jouw-registry-url.com

# Alleen voor dit package (scope-specifiek)
@silverfox14:registry=https://jouw-registry-url.com
```

### Optie B: Alleen bij publish (via --registry)

```bash
npm publish --registry https://jouw-registry-url.com
```

### Optie C: Globale .npmrc (~/.npmrc)

```ini
@silverfox14:registry=https://jouw-registry-url.com
//jouw-registry-url.com/:_authToken=${NPM_TOKEN}
```

---

## Stap 3: Authenticatie

Registries vereisen meestal een token of credentials.

### Token in environment variable (aanbevolen)

```bash
export NPM_TOKEN=jouw-secret-token
```

In `.npmrc`:

```ini
//jouw-registry-url.com/:_authToken=${NPM_TOKEN}
```

### Token in .npmrc (niet committen)

```ini
//jouw-registry-url.com/:_authToken=npm_xxxxxxxxxxxx
```

> **Let op:** Voeg `.npmrc` toe aan `.gitignore` als je tokens erin zet, of gebruik altijd `${NPM_TOKEN}`.

### Basic auth (username:password)

```ini
//jouw-registry-url.com/:_auth="dXNlcm5hbWU6cGFzc3dvcmQ="
```

De waarde is Base64 van `username:password`.

---

## Voorbeelden per registry

### GitHub Packages

1. **Personal Access Token** aanmaken op GitHub:
   - Settings → Developer settings → Personal access tokens
   - Scopes: `read:packages`, `write:packages`

2. **package.json** aanpassen:

```json
{
  "name": "@silverfox14/chain",
  "repository": "github:martijnbokma/chain",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  }
}
```

3. **.npmrc** (project of globaal):

```ini
@silverfox14:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

4. **Publishen:**

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
npm publish
```

5. **Installeren** (voor anderen):

```bash
npm install @silverfox14/chain
```

Of met `.npmrc` in het project dat het package installeert:

```ini
@silverfox14:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

### Verdaccio (zelf-gehost)

1. **Verdaccio starten** (lokaal of op een server):

```bash
npx verdaccio
# Draait op http://localhost:4873
```

2. **Gebruiker aanmaken** (eerste keer):

```bash
npm adduser --registry http://localhost:4873
```

3. **package.json**:

```json
{
  "name": "@silverfox14/chain",
  "publishConfig": {
    "registry": "http://localhost:4873"
  }
}
```

4. **Publishen:**

```bash
npm publish --registry http://localhost:4873
```

5. **Installeren:**

```bash
npm install @silverfox14/chain --registry http://localhost:4873
```

Of in `.npmrc`:

```ini
@silverfox14:registry=http://localhost:4873
```

---

### Algemene private registry (bijv. Artifactory, Nexus)

1. Vraag de registry-URL en een token aan je beheerder.
2. **.npmrc**:

```ini
registry=https://artifactory.jouw-bedrijf.com/artifactory/api/npm/npm-local/
//artifactory.jouw-bedrijf.com/artifactory/api/npm/npm-local/:_authToken=${NPM_TOKEN}
```

3. **package.json**:

```json
{
  "publishConfig": {
    "registry": "https://artifactory.jouw-bedrijf.com/artifactory/api/npm/npm-local/"
  }
}
```

4. **Publishen:**

```bash
export NPM_TOKEN=jouw-token
npm publish
```

---

## Volledige workflow

```bash
# 1. Dependencies en build
bun install
bun run typecheck
bun run test:run
bun run build

# 2. Versie verhogen
npm version patch

# 3. Token zetten (indien nodig)
export NPM_TOKEN=jouw-token
# of: export GITHUB_TOKEN=ghp_xxx voor GitHub Packages

# 4. Publishen
npm publish
# of met expliciete registry:
npm publish --registry https://jouw-registry-url.com
```

---

## .gitignore

Voeg toe als je lokale `.npmrc` tokens bevat:

```
# Alleen als .npmrc tokens bevat
.npmrc
```

Of gebruik een `.npmrc.example` zonder tokens:

```ini
# .npmrc.example — kopieer naar .npmrc en vul in
@silverfox14:registry=https://jouw-registry-url.com
//jouw-registry-url.com/:_authToken=${NPM_TOKEN}
```

---

## Troubleshooting

### "401 Unauthorized"

- Token is verlopen of ongeldig.
- Controleer of de token de juiste scopes heeft (bijv. `write:packages` voor GitHub).

### "404 Not Found" bij install

- De scope `@silverfox14` moet in `.npmrc` naar je registry wijzen.
- Zorg dat de consumer ook de juiste `registry` en `_authToken` heeft.

### "Package name already exists"

- Bump de versie: `npm version patch`.
- Of gebruik een andere scope/naam.

### Verdaccio: "no such package"

- Controleer of je naar de juiste registry publiceert.
- Verdaccio moet draaien voordat je publiceert.

---

## Gerelateerd

- [PUBLISHING.md](./PUBLISHING.md) — Publiceren naar npmjs.com
- [GUIDE.md](./GUIDE.md) — Chain gebruikershandleiding
- [GitHub Packages voor npm](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Verdaccio documentatie](https://verdaccio.org/docs/what-is-verdaccio)
