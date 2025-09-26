import { auth } from '../auth';

/**
 * Generate Better-Auth OpenAPI schema
 * This function calls the auth.api.generateOpenAPISchema() method
 * as documented in the Better-Auth OpenAPI plugin docs
 */
export const generateAuthOpenAPISchema = async () => {
  try {
    const schema = await auth.api.generateOpenAPISchema();
    return schema;
  } catch (error) {
    console.error('Error generating Better-Auth OpenAPI schema:', error);
    throw error;
  }
};

/**
 * Get the complete OpenAPI schema with custom endpoints merged
 */
export const getCompleteOpenAPISchema = async () => {
  const authSchema = await generateAuthOpenAPISchema();

  // Custom endpoints schema for your application
  const customSchema = {
    openapi: '3.0.3',
    info: {
      title: 'Hacker News Clone API',
      version: '1.0.0',
      description: 'Complete API including authentication and custom endpoints',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths: {
      '/api/posts/create-post': {
        post: {
          tags: ['Posts'],
          summary: 'Create a new post',
          description: 'Create a new post (requires authentication)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      minLength: 3,
                      maxLength: 50,
                      description: 'Post title',
                    },
                    url: {
                      type: 'string',
                      format: 'uri',
                      description: 'Post URL (optional)',
                    },
                    content: {
                      type: 'string',
                      minLength: 10,
                      description: 'Post content (optional)',
                    },
                  },
                  required: ['title'],
                  anyOf: [
                    { required: ['url'] },
                    { required: ['content'] },
                  ],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Post created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Post Created' },
                      data: {
                        type: 'object',
                        properties: {
                          postId: { type: 'integer', description: 'Created post ID' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Bad request - validation error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      message: { type: 'string' },
                      isFormError: { type: 'boolean' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized - authentication required',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      message: { type: 'string', example: 'Authentication required' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
          description: 'Session cookie set by Better-Auth',
        },
      },
    },
    tags: [
      {
        name: 'Posts',
        description: 'Post management endpoints',
      },
    ],
  };

  // Merge the schemas
  const mergedSchema = {
    ...authSchema,
    info: {
      ...authSchema.info,
      title: customSchema.info.title,
      description: customSchema.info.description,
    },
    paths: {
      ...authSchema.paths,
      ...customSchema.paths,
    },
    components: {
      ...authSchema.components,
      securitySchemes: {
        ...authSchema.components?.securitySchemes,
        ...customSchema.components.securitySchemes,
      },
    },
    tags: [
      ...(authSchema.tags || []),
      ...customSchema.tags,
    ],
  };

  return mergedSchema;
};

/**
 * Generate and save OpenAPI schema to file
 */
export const saveOpenAPISchema = async (filePath: string = './openapi.json') => {
  const schema = await getCompleteOpenAPISchema();

  try {
    const fs = await import('fs');
    fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
    console.log(`✅ OpenAPI schema saved to ${filePath}`);
    return schema;
  } catch (error) {
    console.error('Error saving OpenAPI schema:', error);
    throw error;
  }
};
