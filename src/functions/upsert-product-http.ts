import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { upsertProduct } from '../app/upsert-product';
import { makeUpsertProductDeps } from '../config/appServices';

const upsertProductHandler = async (
  request: HttpRequest
): Promise<HttpResponseInit> => {
  try {
    const body = (await request.json()) as any;

    // Validate required fields
    if (!body || typeof body !== 'object') {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Request body is required',
        },
      };
    }

    const { id, name, quantity, loanDays, description } = body;

    if (!id || !name || quantity === undefined || loanDays === undefined || !description) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Missing required fields: id, name, quantity, loanDays, description',
        },
      };
    }

    const deps = makeUpsertProductDeps();
    const result = await upsertProduct(deps, {
      id,
      name,
      quantity,
      loanDays,
      description,
    });

    if (!result.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Failed to upsert product',
          error: result.error,
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        ...result.data,
        updatedAt: result.data?.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return {
      status: 500,
      jsonBody: {
        success: false,
        message: 'Internal server error',
        error: (error as Error).message,
      },
    };
  }
};

app.http('upsertProductHttp', {
  methods: ['PUT', 'POST'],
  authLevel: 'anonymous',
  route: 'products',
  handler: upsertProductHandler,
});
