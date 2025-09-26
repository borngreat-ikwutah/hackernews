#!/usr/bin/env bun

import { writeFileSync } from 'fs';
import { join } from 'path';
import { auth } from '../server/auth';
import { getCompleteOpenAPISchema, saveOpenAPISchema } from '../server/utils/openapi-generator';

/**
 * Generate OpenAPI documentation script
 * This script generates the complete OpenAPI schema including Better-Auth endpoints
 * and custom application endpoints
 */

const generateOpenAPIDocumentation = async () => {
  console.log('🚀 Starting OpenAPI documentation generation...\n');

  try {
    // Step 1: Generate Better-Auth OpenAPI schema
    console.log('1️⃣ Generating Better-Auth OpenAPI schema...');
    const authSchema = await auth.api.generateOpenAPISchema();
    console.log('   ✅ Better-Auth schema generated');
    console.log(`   📊 Found ${Object.keys(authSchema.paths || {}).length} auth endpoints`);

    // Step 2: Generate complete merged schema
    console.log('\n2️⃣ Generating complete merged schema...');
    const completeSchema = await getCompleteOpenAPISchema();
    console.log('   ✅ Complete schema generated');
    console.log(`   📊 Total endpoints: ${Object.keys(completeSchema.paths || {}).length}`);

    // Step 3: Save schemas to files
    console.log('\n3️⃣ Saving schemas to files...');

    // Save Better-Auth only schema
    writeFileSync('./openapi-auth.json', JSON.stringify(authSchema, null, 2));
    console.log('   ✅ Better-Auth schema saved to openapi-auth.json');

    // Save complete merged schema
    writeFileSync('./openapi.json', JSON.stringify(completeSchema, null, 2));
    console.log('   ✅ Complete schema saved to openapi.json');

    // Step 4: Generate markdown documentation
    console.log('\n4️⃣ Generating markdown documentation...');
    const markdownContent = generateMarkdownDocs(completeSchema);
    writeFileSync('./API.md', markdownContent);
    console.log('   ✅ Markdown documentation saved to API.md');

    // Step 5: Summary
    console.log('\n🎉 OpenAPI documentation generation complete!\n');
    console.log('📁 Generated files:');
    console.log('   • openapi.json - Complete API schema');
    console.log('   • openapi-auth.json - Better-Auth only schema');
    console.log('   • API.md - Human-readable documentation');

    console.log('\n🌐 Access your documentation:');
    console.log('   • Unified Docs (Scalar): http://localhost:3000/docs');
    console.log('   • Better-Auth Reference: http://localhost:3000/api/auth/reference');
    console.log('   • Complete Schema JSON: http://localhost:3000/api/open-api');

    // Step 6: Validation
    console.log('\n✅ Schema validation:');
    console.log(`   • OpenAPI version: ${completeSchema.openapi}`);
    console.log(`   • API title: ${completeSchema.info.title}`);
    console.log(`   • API version: ${completeSchema.info.version}`);
    console.log(`   • Total paths: ${Object.keys(completeSchema.paths).length}`);
    console.log(`   • Total components: ${Object.keys(completeSchema.components?.schemas || {}).length}`);

  } catch (error) {
    console.error('❌ Error generating OpenAPI documentation:', error);
    process.exit(1);
  }
};

/**
 * Generate markdown documentation from OpenAPI schema
 */
const generateMarkdownDocs = (schema: any): string => {
  const { info, paths, servers } = schema;

  let markdown = `# ${info.title}\n\n`;
  markdown += `${info.description}\n\n`;
  markdown += `**Version:** ${info.version}\n\n`;

  if (servers && servers.length > 0) {
    markdown += `## Base URL\n\n`;
    markdown += `\`${servers[0].url}\`\n\n`;
  }

  markdown += `## Authentication\n\n`;
  markdown += `This API uses cookie-based authentication powered by Better-Auth. The session cookie is automatically managed by Better-Auth.\n\n`;

  markdown += `## Interactive Documentation\n\n`;
  markdown += `- **Unified Documentation**: [/docs](http://localhost:3000/docs) - Complete API documentation with Scalar\n`;
  markdown += `- **Better-Auth Reference**: [/api/auth/reference](http://localhost:3000/api/auth/reference) - Better-Auth specific endpoints\n\n`;

  markdown += `## API Endpoints\n\n`;

  // Group endpoints by tags
  const endpointsByTag: { [key: string]: any[] } = {};

  Object.entries(paths).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, spec]: [string, any]) => {
      const tags = spec.tags || ['Untagged'];
      tags.forEach((tag: string) => {
        if (!endpointsByTag[tag]) {
          endpointsByTag[tag] = [];
        }
        endpointsByTag[tag].push({
          method: method.toUpperCase(),
          path,
          summary: spec.summary || 'No summary',
          description: spec.description || '',
        });
      });
    });
  });

  Object.entries(endpointsByTag).forEach(([tag, endpoints]) => {
    markdown += `### ${tag}\n\n`;
    endpoints.forEach(endpoint => {
      markdown += `#### \`${endpoint.method} ${endpoint.path}\`\n\n`;
      markdown += `${endpoint.summary}\n\n`;
      if (endpoint.description) {
        markdown += `${endpoint.description}\n\n`;
      }
    });
  });

  markdown += `## Development\n\n`;
  markdown += `To start the development server:\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `bun run dev\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `To regenerate this documentation:\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `bun run scripts/generate-openapi.ts\n`;
  markdown += `\`\`\`\n`;

  return markdown;
};

// Run the script if called directly
if (import.meta.main) {
  generateOpenAPIDocumentation();
}

export { generateOpenAPIDocumentation };
