export const ERROR_CODES = {
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VIP_REQUIRED: 'VIP_REQUIRED',
  MEMBER_REQUIRED: 'MEMBER_REQUIRED',
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Không tìm thấy tài nguyên yêu cầu.',
  [ERROR_CODES.UNAUTHORIZED]: 'Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập.',
  [ERROR_CODES.FORBIDDEN]: 'Bạn không có quyền thực hiện thao tác này.',
  [ERROR_CODES.VIP_REQUIRED]: 'Tính năng hoặc nội dung này yêu cầu tài khoản VIP.',
  [ERROR_CODES.MEMBER_REQUIRED]: 'Vui lòng đăng nhập tài khoản thành viên để đọc nội dung này.',
  [ERROR_CODES.BAD_REQUEST]: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Dữ liệu nhập vào chưa chính xác. Vui lòng kiểm tra lại các trường.',
  [ERROR_CODES.FILE_TOO_LARGE]: 'Dung lượng tệp quá lớn. Vui lòng tải lên tệp nhỏ hơn.',
  [ERROR_CODES.ALREADY_EXISTS]: 'Dữ liệu đã tồn tại trong hệ thống.',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau ít phút.',
};

/**
 * Extracts error code and returns user-friendly message based on Backend error response.
 * @param {object} error - Axios error object
 * @param {string} fallbackMessage - Custom fallback message if no code/message is found
 * @returns {string}
 */
export const getErrorMessage = (error, fallbackMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.') => {
  if (!error) return fallbackMessage;

  const data = error.response?.data;
  const code = data?.code;

  // 1. Match specific Error Code from Backend
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  // 2. Return backend message if present and specific
  if (data?.message) {
    return data.message;
  }

  // 3. Fallback to HTTP Status mapping
  const status = error.response?.status;
  if (status === 401) return ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED];
  if (status === 403) return ERROR_MESSAGES[ERROR_CODES.FORBIDDEN];
  if (status === 404) return ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND];

  return fallbackMessage;
};

/**
 * Gets exact error code string returned by backend API
 * @param {object} error 
 * @returns {string|null}
 */
export const getErrorCode = (error) => {
  return error?.response?.data?.code || null;
};
