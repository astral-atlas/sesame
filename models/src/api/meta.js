// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { createObjectCaster, createConstantCaster, castObject, castString, createConstantUnionCaster } from '@lukekaalim/cast';

const ERROR_CODES = {
  missingAuthoization:  'MIS_AUTH',
  invalidAuthorization: 'INVALID_AUTH',
  revokedAuthorization: 'REVOKED',
  unauthorizedAccess:   'UNAUTHORIZED',
  notFound:             'NOT_FOUND',
};

/*::
export type ErrorCode = $Values<typeof ERROR_CODES>

export type APIError = {
  code: ErrorCode,
  shortMessage: string,
  longMessage: string,
};
export type APIErrorResponse = {|
  type: 'error',
  error: APIError,
|};

export type APIResponse<APISuccessResponse: { type: any }> =
  | APIErrorResponse
  | APISuccessResponse
*/

export const castAPIError/*: Cast<APIError>*/ = createObjectCaster({
  code: createConstantUnionCaster([
    ERROR_CODES.missingAuthoization,
    ERROR_CODES.invalidAuthorization,
    ERROR_CODES.revokedAuthorization,
    ERROR_CODES.unauthorizedAccess,
    ERROR_CODES.notFound
  ]),
  shortMessage: castString,
  longMessage: castString,
});
export const castAPIErrorResponse/*: Cast<APIErrorResponse>*/ = createObjectCaster({
  type: createConstantCaster('error'),
  error: castAPIError,
});

export const createAPIResponseCaster = /*:: <T: { type: any }>*/(castSuccessResponse/*: Cast<T>*/)/*: Cast<APIResponse<T>>*/ => (value) => {
  const objectValue = castObject(value);
  switch (objectValue.type) {
    case 'error':
      return castAPIErrorResponse(value);
    default:
      return castSuccessResponse(value);
  }
};