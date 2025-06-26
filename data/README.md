# BitCrafty Data Directory Structure

## Overview
The data directory is now modularized for maintainability and clarity. Each file contains a single type of entity or enum-like list.

```
/data
  items.json              ← Core game items
  crafts.json             ← All crafting recipes
  requirements.json       ← Tool/profession/building requirements
  metadata/
    professions.json      ← Enum-like list of valid professions
    tools.json            ← Enum-like list of valid tools
    buildings.json        ← Enum-like list of buildings
```

## Entity ID Format
All entity references use the format:

```
[entity-type]:[category/namespace]:[identifier]
```

- **entity-type**: The type of entity (e.g., `item`, `craft`, `requirement`, `profession`, `tool`, `building`)
- **category/namespace**: The logical grouping or category (e.g., `tailoring`, `foraging`, `metal`)
- **identifier**: The unique name or key for the entity within its namespace

### Examples
- `item:wood:rough-trunk`
- `craft:tailoring:rough-spool`
- `requirement:tailoring:basic-tools`
- `tool:metal:machete`
- `building:tailoring:loom`

## Notes
- All references between entities (e.g., crafts, requirements, professions, tools, buildings) must use these namespaced IDs.
- This structure supports deduplication, efficient lookups, and maintainability.

# BitCrafty Data Format

This repository uses a **namespaced ID standard** for all entities (items, crafts, professions, etc.) to support consistent structure, easier debugging, and scalable referencing in tools like Zustand and DagreJS.

---

## 📦 ID Standard: `[entity-type]:[category]:[identifier]`

Each object in the data store (item, craft, tool, etc.) uses a globally unique string ID in the following format:


### ✅ Examples

| Entity Type   | Category      | Identifier         | Full ID                            |
|---------------|---------------|--------------------|------------------------------------|
| `item`        | `wood`        | `rough-log`        | `item:wood:rough-log`              |
| `craft`       | `tailoring`   | `rough-spool`      | `craft:tailoring:rough-spool`      |
| `requirement` | `tailoring`   | `basic-tools`      | `requirement:tailoring:basic-tools`|
| `profession`  | `tailoring`   | —                  | `profession:tailoring`             |
| `tool`        | `scissors`    | —                  | `tool:scissors`                    |
| `building`    | `tailoring`   | `loom`             | `building:tailoring:loom`          |

---

## 🧠 Benefits

### ✅ **Globally Unique IDs**
- Prevents collisions across entity types.
- Allows merging or linking data across modules, expansions, or mods.

### ✅ **Human-Readable & Debug-Friendly**
- IDs like `craft:tailoring:cloth-strip` are self-explanatory.
- Useful for logs, developer tools, and debugging graphs.

### ✅ **Easy Lookup & Filtering**
- Works seamlessly with `Record<string, Entity>` maps in Zustand.
- Enables filtering by prefix, e.g. `"item:"`, `"craft:tailoring:"`.

### ✅ **Ready for Graph Use (DagreJS)**
- IDs are compatible as graph node identifiers.
- Relationships (e.g., `material → craft`) are readable and traceable.

---

## ID Guidelines

### Format
- Use **lowercase** and **hyphens** (`-`) in identifiers.
- Use **singular nouns** for clarity (e.g., `cloth-strip`, not `cloth-strips`).
- Categories are functional or thematic groupings (e.g. `wood`, `tailoring`, `plant`, `metal`).

### Reserved Prefixes

| Prefix        | Description             |
|---------------|-------------------------|
| `item:`       | Items in the game world |
| `craft:`      | Crafting recipes        |
| `requirement:`| Crafting requirements   |
| `tool:`       | Required tools          |
| `building:`   | Required buildings      |
| `profession:` | Skill professions       |
