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
  }

  warning(message) {
    this.warnings.push(message);
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
    crafts.forEach(craft => {
      // Check materials
      craft.materials?.forEach(material => {
        if (!this.itemIds.has(material.item)) {
          this.error(`Craft "${craft.id}" references non-existent item "${material.item}" in materials`);
        }
      });

      // Check outputs
      craft.outputs?.forEach(output => {
        if (!this.itemIds.has(output.item)) {
          this.error(`Craft "${craft.id}" references non-existent item "${output.item}" in outputs`);
        }
      });
    });
  }

  // Test 2: Validate entity ID profession categories
  validateEntityProfessionCategories() {
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
      }
    });
  }

  // Test 3: Validate all crafts have requirements
  validateCraftRequirements() {
    crafts.forEach(craft => {
      if (!craft.requirement) {
        this.error(`Craft "${craft.id}" is missing requirement field`);
      } else if (!this.requirementIds.has(craft.requirement)) {
        this.error(`Craft "${craft.id}" references non-existent requirement "${craft.requirement}"`);
      }
    });
  }

  // Test 4: Validate requirement entity IDs with metadata
  validateRequirementMetadataReferences() {
    requirements.forEach(req => {
      // Validate requirement ID format
      if (!isValidEntityIdFormat(req.id, 'requirement')) {
        this.error(`Requirement "${req.id}" has invalid ID format (expected: requirement:profession:identifier)`);
      }

      // Validate profession reference
      if (req.profession?.name) {
        if (!this.professionIds.has(req.profession.name)) {
          this.error(`Requirement "${req.id}" references non-existent profession "${req.profession.name}"`);
        }
      } else {
        this.error(`Requirement "${req.id}" is missing profession.name`);
      }

      // Validate tool reference (if present)
      if (req.tool?.name && !this.toolIds.has(req.tool.name)) {
        this.error(`Requirement "${req.id}" references non-existent tool "${req.tool.name}"`);
      }

      // Validate building reference (if present)
      if (req.building?.name && !this.buildingIds.has(req.building.name)) {
        this.error(`Requirement "${req.id}" references non-existent building "${req.building.name}"`);
      }

      // Validate level values
      if (req.profession?.level && (typeof req.profession.level !== 'number' || req.profession.level < 1)) {
        this.error(`Requirement "${req.id}" has invalid profession level: ${req.profession.level}`);
      }

      if (req.tool?.level && (typeof req.tool.level !== 'number' || req.tool.level < 1)) {
        this.error(`Requirement "${req.id}" has invalid tool level: ${req.tool.level}`);
      }

      if (req.building?.level && (typeof req.building.level !== 'number' || req.building.level < 1)) {
        this.error(`Requirement "${req.id}" has invalid building level: ${req.building.level}`);
      }
    });
  }

  // Test 5: Additional data integrity checks
  validateDataIntegrity() {
    // Check for duplicate IDs
    const allIds = [...items.map(i => i.id), ...crafts.map(c => c.id), ...requirements.map(r => r.id)];
    const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      duplicateIds.forEach(id => this.error(`Duplicate ID found: ${id}`));
    }

    // Check for missing names
    [...items, ...crafts, ...requirements].forEach(entity => {
      if (!entity.name || entity.name.trim() === '') {
        this.error(`Entity "${entity.id}" is missing name`);
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
  }

  // Generate detailed data overview table
  generateDataOverviewTable() {

    // Collect missing references
    const missingItemRefs = new Set();
    const missingRequirementRefs = new Set();
    const missingProfessionRefs = new Set();
    const missingToolRefs = new Set();
    const missingBuildingRefs = new Set();

    // Check craft references
    crafts.forEach(craft => {
      craft.materials?.forEach(material => {
        if (!this.itemIds.has(material.item)) {
          missingItemRefs.add(material.item);
        }
      });
      craft.outputs?.forEach(output => {
        if (!this.itemIds.has(output.item)) {
          missingItemRefs.add(output.item);
        }
      });
      if (craft.requirement && !this.requirementIds.has(craft.requirement)) {
        missingRequirementRefs.add(craft.requirement);
      }
    });

    // Check requirement references
    requirements.forEach(req => {
      if (req.profession?.name && !this.professionIds.has(req.profession.name)) {
        missingProfessionRefs.add(req.profession.name);
      }
      if (req.tool?.name && !this.toolIds.has(req.tool.name)) {
        missingToolRefs.add(req.tool.name);
      }
      if (req.building?.name && !this.buildingIds.has(req.building.name)) {
        missingBuildingRefs.add(req.building.name);
      }
    });

    // Create overview table data
    const tableData = [
      {
        'Data Type': 'Items',
        'Count': items.length,
        'Missing References': missingItemRefs.size > 0 ? `${missingItemRefs.size} missing` : '✅ All valid',
        'Status': missingItemRefs.size > 0 ? '❌ ISSUES' : '✅ OK'
      },
      {
        'Data Type': 'Crafts',
        'Count': crafts.length,
        'Missing References': missingRequirementRefs.size > 0 ? `${missingRequirementRefs.size} missing` : '✅ All valid',
        'Status': missingRequirementRefs.size > 0 ? '❌ ISSUES' : '✅ OK'
      },
      {
        'Data Type': 'Requirements',
        'Count': requirements.length,
        'Missing References': (missingProfessionRefs.size + missingToolRefs.size + missingBuildingRefs.size) > 0 
          ? `${missingProfessionRefs.size + missingToolRefs.size + missingBuildingRefs.size} missing` 
          : '✅ All valid',
        'Status': (missingProfessionRefs.size + missingToolRefs.size + missingBuildingRefs.size) > 0 ? '❌ ISSUES' : '✅ OK'
      },
      {
        'Data Type': 'Professions',
        'Count': professions.length,
        'Missing References': '✅ N/A (base data)',
        'Status': '✅ OK'
      },
      {
        'Data Type': 'Tools',
        'Count': tools.length,
        'Missing References': '✅ N/A (base data)',
        'Status': '✅ OK'
      },
      {
        'Data Type': 'Buildings',
        'Count': buildings.length,
        'Missing References': '✅ N/A (base data)',
        'Status': '✅ OK'
      }
    ];

    console.table(tableData);

    // Show detailed missing reference information if any exist
    if (missingItemRefs.size > 0) {
      console.log("\n❌ Missing Item References:");
      console.table(Array.from(missingItemRefs).map(id => ({ 'Missing Item ID': id })));
    }

    if (missingRequirementRefs.size > 0) {
      console.log("\n❌ Missing Requirement References:");
      console.table(Array.from(missingRequirementRefs).map(id => ({ 'Missing Requirement ID': id })));
    }

    if (missingProfessionRefs.size > 0) {
      console.log("\n❌ Missing Profession References:");
      console.table(Array.from(missingProfessionRefs).map(id => ({ 'Missing Profession ID': id })));
    }

    if (missingToolRefs.size > 0) {
      console.log("\n❌ Missing Tool References:");
      console.table(Array.from(missingToolRefs).map(id => ({ 'Missing Tool ID': id })));
    }

    if (missingBuildingRefs.size > 0) {
      console.log("\n❌ Missing Building References:");
      console.table(Array.from(missingBuildingRefs).map(id => ({ 'Missing Building ID': id })));
    }

    // Summary statistics
    const totalMissing = missingItemRefs.size + missingRequirementRefs.size + 
                        missingProfessionRefs.size + missingToolRefs.size + missingBuildingRefs.size;
    
    if (totalMissing === 0) {
      console.log("✅ All data references are valid - no missing entities found!");
    } else {
      this.error(`Found ${totalMissing} total missing references across all data files`);
    }
  }

  // Run all tests
  runAllTests() {
    console.log("🧪 BitCrafty Data Validation");

    this.createLookupSets();
    
    // Run validation tests silently
    this.validateCraftItemReferences();
    this.validateEntityProfessionCategories();
    this.validateCraftRequirements();
    this.validateRequirementMetadataReferences();
    this.validateDataIntegrity();
    
    // Generate overview table with missing references
    this.generateDataOverviewTable();

    // Summary
    console.log(`\n📋 Validation Result: ${this.errors.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);
    if (this.errors.length > 0) {
      console.log(`Errors: ${this.errors.length}`);
    }
    if (this.warnings.length > 0) {
      console.log(`Warnings: ${this.warnings.length}`);
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors found:");
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return this.errors.length === 0;
  }
}

// Export for use in other test files or manual running
export { DataValidator };

// Run tests if this file is executed directly
if (import.meta.url === `file://${fileURLToPath(import.meta.url)}` || 
    import.meta.url.endsWith(process.argv[1]) ||
    process.argv[1]?.endsWith('data-validation.test.js')) {
  const validator = new DataValidator();
  const success = validator.runAllTests();
  process.exit(success ? 0 : 1);
}
