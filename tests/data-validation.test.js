/**
 * BitCrafty Data Model Validation Tests
 * 
 * Validates data integrity across items.json, crafts.json, requirements.json,
 * and metadata files to catch data issues before they cause runtime errors.
 */

import fs from 'fs';
import path from 'path';

// Test configuration
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const METADATA_DIR = path.join(DATA_DIR, 'metadata');

// Load all data files
const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'items.json'), 'utf8'));
const crafts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'crafts.json'), 'utf8'));
const requirements = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'requirements.json'), 'utf8'));
const professions = JSON.parse(fs.readFileSync(path.join(METADATA_DIR, 'professions.json'), 'utf8'));
const tools = JSON.parse(fs.readFileSync(path.join(METADATA_DIR, 'tools.json'), 'utf8'));
const buildings = JSON.parse(fs.readFileSync(path.join(METADATA_DIR, 'buildings.json'), 'utf8'));

// Helper functions
function extractProfessionFromId(entityId) {
  const parts = entityId.split(':');
  if (parts.length >= 2) {
    return parts[1];
  }
  return null;
}

function isValidEntityIdFormat(entityId, expectedType) {
  const parts = entityId.split(':');
  return parts.length === 3 && parts[0] === expectedType;
}

// Test suites
class DataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  error(message) {
    this.errors.push(message);
    console.error(`❌ ERROR: ${message}`);
  }

  warning(message) {
    this.warnings.push(message);
    console.warn(`⚠️  WARNING: ${message}`);
  }

  info(message) {
    console.log(`ℹ️  ${message}`);
  }

  success(message) {
    console.log(`✅ ${message}`);
  }

  // Create lookup sets for quick validation
  createLookupSets() {
    this.itemIds = new Set(items.map(item => item.id));
    this.craftIds = new Set(crafts.map(craft => craft.id));
    this.requirementIds = new Set(requirements.map(req => req.id));
    this.professionNames = new Set(professions.map(prof => prof.id.split(':')[1]));
    this.toolIds = new Set(tools.map(tool => tool.id));
    this.buildingIds = new Set(buildings.map(building => building.id));
    this.professionIds = new Set(professions.map(prof => prof.id));
  }

  // Test 1: Validate all item IDs in crafts are valid
  validateCraftItemReferences() {
    this.info("Test 1: Validating craft item references...");
    let validRefs = 0;
    let totalRefs = 0;

    crafts.forEach(craft => {
      // Check materials
      craft.materials?.forEach(material => {
        totalRefs++;
        if (!this.itemIds.has(material.item)) {
          this.error(`Craft "${craft.id}" references non-existent item "${material.item}" in materials`);
        } else {
          validRefs++;
        }
      });

      // Check outputs
      craft.outputs?.forEach(output => {
        totalRefs++;
        if (!this.itemIds.has(output.item)) {
          this.error(`Craft "${craft.id}" references non-existent item "${output.item}" in outputs`);
        } else {
          validRefs++;
        }
      });
    });

    if (this.errors.length === 0) {
      this.success(`All ${totalRefs} item references in crafts are valid`);
    }
  }

  // Test 2: Validate entity ID profession categories
  validateEntityProfessionCategories() {
    this.info("Test 2: Validating entity profession categories...");
    let validItems = 0;
    let validCrafts = 0;

    // Validate items
    items.forEach(item => {
      if (!isValidEntityIdFormat(item.id, 'item')) {
        this.error(`Item "${item.id}" has invalid ID format (expected: item:profession:identifier)`);
        return;
      }

      const profession = extractProfessionFromId(item.id);
      if (!profession) {
        this.error(`Item "${item.id}" has no profession in ID`);
      } else if (!this.professionNames.has(profession)) {
        this.error(`Item "${item.id}" has invalid profession "${profession}" (not found in professions.json)`);
      } else {
        validItems++;
      }
    });

    // Validate crafts
    crafts.forEach(craft => {
      if (!isValidEntityIdFormat(craft.id, 'craft')) {
        this.error(`Craft "${craft.id}" has invalid ID format (expected: craft:profession:identifier)`);
        return;
      }

      const profession = extractProfessionFromId(craft.id);
      if (!profession) {
        this.error(`Craft "${craft.id}" has no profession in ID`);
      } else if (!this.professionNames.has(profession)) {
        this.error(`Craft "${craft.id}" has invalid profession "${profession}" (not found in professions.json)`);
      } else {
        validCrafts++;
      }
    });

    if (validItems === items.length && validCrafts === crafts.length) {
      this.success(`All ${items.length} items and ${crafts.length} crafts have valid profession categories`);
    }
  }

  // Test 3: Validate all crafts have requirements
  validateCraftRequirements() {
    this.info("Test 3: Validating craft requirements...");
    let craftsWithRequirements = 0;

    crafts.forEach(craft => {
      if (!craft.requirement) {
        this.error(`Craft "${craft.id}" is missing requirement field`);
      } else if (!this.requirementIds.has(craft.requirement)) {
        this.error(`Craft "${craft.id}" references non-existent requirement "${craft.requirement}"`);
      } else {
        craftsWithRequirements++;
      }
    });

    if (craftsWithRequirements === crafts.length) {
      this.success(`All ${crafts.length} crafts have valid requirements`);
    }
  }

  // Test 4: Validate requirement entity IDs with metadata
  validateRequirementMetadataReferences() {
    this.info("Test 4: Validating requirement metadata references...");
    let validRequirements = 0;

    requirements.forEach(req => {
      let isValid = true;

      // Validate requirement ID format
      if (!isValidEntityIdFormat(req.id, 'requirement')) {
        this.error(`Requirement "${req.id}" has invalid ID format (expected: requirement:profession:identifier)`);
        isValid = false;
      }

      // Validate profession reference
      if (req.profession?.name) {
        if (!this.professionIds.has(req.profession.name)) {
          this.error(`Requirement "${req.id}" references non-existent profession "${req.profession.name}"`);
          isValid = false;
        }
      } else {
        this.error(`Requirement "${req.id}" is missing profession.name`);
        isValid = false;
      }

      // Validate tool reference (if present)
      if (req.tool?.name) {
        if (!this.toolIds.has(req.tool.name)) {
          this.error(`Requirement "${req.id}" references non-existent tool "${req.tool.name}"`);
          isValid = false;
        }
      }

      // Validate building reference (if present)
      if (req.building?.name) {
        if (!this.buildingIds.has(req.building.name)) {
          this.error(`Requirement "${req.id}" references non-existent building "${req.building.name}"`);
          isValid = false;
        }
      }

      // Validate level values
      if (req.profession?.level && (typeof req.profession.level !== 'number' || req.profession.level < 1)) {
        this.error(`Requirement "${req.id}" has invalid profession level: ${req.profession.level}`);
        isValid = false;
      }

      if (req.tool?.level && (typeof req.tool.level !== 'number' || req.tool.level < 1)) {
        this.error(`Requirement "${req.id}" has invalid tool level: ${req.tool.level}`);
        isValid = false;
      }

      if (req.building?.level && (typeof req.building.level !== 'number' || req.building.level < 1)) {
        this.error(`Requirement "${req.id}" has invalid building level: ${req.building.level}`);
        isValid = false;
      }

      if (isValid) {
        validRequirements++;
      }
    });

    if (validRequirements === requirements.length) {
      this.success(`All ${requirements.length} requirements have valid metadata references`);
    }
  }

  // Test 5: Additional data integrity checks
  validateDataIntegrity() {
    this.info("Test 5: Additional data integrity checks...");

    // Check for duplicate IDs
    const allIds = [...items.map(i => i.id), ...crafts.map(c => c.id), ...requirements.map(r => r.id)];
    const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      duplicateIds.forEach(id => this.error(`Duplicate ID found: ${id}`));
    }

    // Check for missing names
    let missingNames = 0;
    [...items, ...crafts, ...requirements].forEach(entity => {
      if (!entity.name || entity.name.trim() === '') {
        this.error(`Entity "${entity.id}" is missing name`);
        missingNames++;
      }
    });

    // Check for orphaned requirements (requirements not used by any craft)
    const usedRequirements = new Set(crafts.map(craft => craft.requirement).filter(Boolean));
    const orphanedRequirements = requirements.filter(req => !usedRequirements.has(req.id));
    if (orphanedRequirements.length > 0) {
      orphanedRequirements.forEach(req => 
        this.warning(`Requirement "${req.id}" is not used by any craft`)
      );
    }

    // Check for items that are only outputs (never used as materials)
    const usedAsMaterials = new Set();
    crafts.forEach(craft => {
      craft.materials?.forEach(material => usedAsMaterials.add(material.item));
    });
    const outputOnlyItems = items.filter(item => !usedAsMaterials.has(item.id));
    if (outputOnlyItems.length > 0) {
      this.info(`Found ${outputOnlyItems.length} items that are only craft outputs (end products)`);
    }

    if (duplicateIds.length === 0 && missingNames === 0) {
      this.success("Data integrity checks passed");
    }
  }

  // Test 6: Profession distribution analysis
  analyzeProfessionDistribution() {
    this.info("Test 6: Analyzing profession distribution...");

    const itemsByProfession = {};
    const craftsByProfession = {};

    items.forEach(item => {
      const profession = extractProfessionFromId(item.id);
      if (profession) {
        itemsByProfession[profession] = (itemsByProfession[profession] || 0) + 1;
      }
    });

    crafts.forEach(craft => {
      const profession = extractProfessionFromId(craft.id);
      if (profession) {
        craftsByProfession[profession] = (craftsByProfession[profession] || 0) + 1;
      }
    });

    console.log("\n📊 Profession Distribution:");
    console.log("Items by profession:");
    Object.entries(itemsByProfession)
      .sort(([,a], [,b]) => b - a)
      .forEach(([prof, count]) => console.log(`  ${prof}: ${count} items`));

    console.log("Crafts by profession:");
    Object.entries(craftsByProfession)
      .sort(([,a], [,b]) => b - a)
      .forEach(([prof, count]) => console.log(`  ${prof}: ${count} crafts`));

    // Check for professions with no items or crafts
    this.professionNames.forEach(profession => {
      if (!itemsByProfession[profession] && !craftsByProfession[profession]) {
        this.warning(`Profession "${profession}" has no items or crafts`);
      }
    });
  }

  // Run all tests
  runAllTests() {
    console.log("🧪 BitCrafty Data Validation Tests");
    console.log("=====================================\n");

    this.createLookupSets();
    
    this.validateCraftItemReferences();
    this.validateEntityProfessionCategories();
    this.validateCraftRequirements();
    this.validateRequirementMetadataReferences();
    this.validateDataIntegrity();
    this.analyzeProfessionDistribution();

    // Summary
    console.log("\n📋 Test Summary:");
    console.log(`✅ ${this.errors.length === 0 ? 'PASSED' : 'FAILED'}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log("\n❌ Errors found - fix these before merging:");
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  Warnings (consider reviewing):");
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (this.errors.length === 0) {
      console.log("\n🎉 All data validation tests passed!");
    }

    return this.errors.length === 0;
  }
}

// Export for use in other test files or manual running
export { DataValidator };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DataValidator();
  const success = validator.runAllTests();
  process.exit(success ? 0 : 1);
}
