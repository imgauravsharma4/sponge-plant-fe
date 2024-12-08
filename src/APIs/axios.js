import Axios from "axios";
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const API_V1 = "api/v1";
const URL = `${API_BASE_URL}/${API_V1}`;

console.log("url", URL);
function authRequestInterceptor(config) {
  config.headers = config.headers ?? {};
  // const token = storage.getToken();

  // if (token && token.accessToken) {
  //   config.headers.authorization = `Bearer ${token.accessToken}`;
  // }
  config.headers.Accept = "application/json";
  return config;
}
export const axios = Axios.create({
  baseURL: API_BASE_URL,
});
axios.interceptors.request.use(authRequestInterceptor);
axios.interceptors.response.use(
  (response) => {
    return response.data?.result;
  },
  (error) => {
    let message = error.response?.data?.message || error.message;
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.errors
    ) {
      message = error.response.data.error.errors.join(",");
    }
    // Handle Error
    // eslint-disable-next-line no-undef
    return Promise.reject({
      statusCode: error.response?.status,
      message: message,
    });
  }
);
