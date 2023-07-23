import axios from 'axios';
import url from './Environment.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

// let baseURL = url['STAGING'].BaseURL;
let baseURL = url['STAGING_TWO'].BaseURL;
// let baseURL = url['DEV'].BaseURL;

// export const loginApi = payload => {
//   return axios.post(
//     'https://web-grainz-dev.azurewebsites.net/connect/token',
//     payload,
//     {
//       headers: {
//         Accept: '*/*',
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     },
//   );
// };

// export const loginApi = payload => {
//   return axios.post(
//     'https://grainzwebapiq.azurewebsites.net/connect/token',
//     payload,
//     {
//       headers: {
//         Accept: '*/*',
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     },
//   );
// };

export const loginApi = payload => {
  const url = 'https://web-grainz-uat.azurewebsites.net/connect/token';
  return axios.post(url, payload, {
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export async function getMyProfileApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(baseURL + '/Account/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getCountriesApi() {
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(baseURL + '/Lookup/GetCountries', {
    headers: {
      LocationId: location,
      Language: language,
    },
  });
}

export async function getEnvironmentApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(baseURL + '/Location/get environment', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getUsersApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(baseURL + '/User/get current location users', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getPendingMepsApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(baseURL + '/Recipe/pending meps', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}
export async function getMepsHistoryApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(baseURL + '/Recipe/mep history', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getMepsOldHistoryApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(baseURL + '/Recipe/mep old history', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export const deleteMepApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.post(baseURL + '/Recipe/delete mep', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const forgotPassApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/Account/Forgot Password', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getMepRecipesApi = async date => {
  let url = baseURL + `/Recipe/mep recipes?productionDate=${date}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getMepRecipeByIdsApi = async id => {
  let url = baseURL + `/Recipe/mepbyid?Id=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getAdvanceRecipeByIdsApi = async recipeId => {
  let url = baseURL + `/Recipe/recipe advance details?Id=${recipeId}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const newMepListApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/Recipe/new mep list', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const updateMepListApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/Recipe/update mep list', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export async function getManualLogList() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/Manuallog/manual logs', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export const deleteManualLog = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/ManualLog/delete manual log', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};
export const getManualLogsById = async id => {
  let url = baseURL + `/ManualLog/manual log by id?Id=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export async function getManualLogTypes() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/ManualLog/manual log types', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getManualLogItemList() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/ManualLog/manual log item list 2', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export const updateManualLogApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/ManualLog/update manual log', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addManualLogApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/ManualLog/add manual log', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export async function getCasualPurchasesApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/CasulPurchase/getinventorylist', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export const getCasualPurchasesByPageApi = async (pageNumber, pageSize) => {
  let url =
    baseURL +
    `/CasulPurchase/getlistbypage?PageNumber=${pageNumber}&PageSize=${pageSize}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getSearchDataApi = async (criteria, pageNumber, pageSize) => {
  let url =
    baseURL +
    `/CasulPurchase/search?Criteria=${criteria}&PageNumber=${pageNumber}&PageSize=${pageSize}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getfilteredDataApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/CasulPurchase/get list by filter', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getfilteredOrderDataApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/Order/filter orders', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addOrderApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/Order/add order', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addDraftApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/Order/add draft', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export async function getSupplierListApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/Supplier/Supplier list', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getSupplierListNoAccApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/Lookup/Suppliers with no accounts', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export const deleteOrderApi = async (id, payload) => {
  let url = baseURL + `/Order/Delete order?Id=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getOrderByIdApi = async id => {
  let url = baseURL + `/Order/order by id?Id=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const viewCreditNoteApi = async id => {
  let url =
    baseURL +
    `/SupplierCreditNoteRequest/view credit note request?OrderItemId=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const creditCreditNoteApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + '/SupplierCreditNoteRequest/create credit note request',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getInventoryByIdApi = async id => {
  let url = baseURL + `/Inventory/inventorybyid?Id=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export async function getInventoryListApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/Inventory/inventory list', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export const updateOrderApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/Order/update casual purchase order', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getOrderItemByIdApi = async id => {
  let url = baseURL + `/Order/order item by id?Id=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getOrderImagesByIdApi = async id => {
  let url = baseURL + `/Order/order images by id?id=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export async function getDepartmentsApi() {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/Lookup/Departments', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getNewStockTakeApi(id, date) {
  let url =
    baseURL + `/StockTake/new stock?DepartmentId=${id}&StockTakeDate=${date}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function lookupInventoryApi(depatId) {
  let url =
    baseURL +
    `/Lookup/Inventory categories by department?DepartmentId=${depatId}&IncludeEmpty=false`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getNewTopStockTakeApi(id, date, count) {
  let url =
    baseURL +
    `/StockTake/top new stock?DepartmentId=${id}&StockTakeDate=${date}&count=${count}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getPreviousStockDatesApi(id) {
  let url =
    baseURL +
    `/StockTake/previous stock dates by department id?DepartmentId=${id}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export async function getPreviousStockDatesDataApi(date) {
  let url =
    baseURL + `/StockTake/stock take list by date?StockTakeDate=${date}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
}

export const updateStockTakeApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/StockTake/update stocktake', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addStockTakeApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/StockTake/add stocktake', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const inventoryLevelsApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/Inventory/inventory levels', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const eventsAdminApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/Event/Events', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getDepartmentsAdminApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + '/Lookup/Departments', {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getDepartmentsReportsAdminApi = async (depId, time) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL +
      `/Report/GM report by department?DepartmentId=${depId}&Type=${time}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const menuAnalysisAdminApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Report/Menu analysis report`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const salesReportAdminApi = async (startDate, endDate) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  const url =
    baseURL + `/report/sales report?StartDate=${startDate}&EndDate=${endDate}`;

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getOrderingCountApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  const finalURL = id
    ? `/Order/orders count?supplierId=${id}`
    : `/Order/orders count`;

  return axios.get(baseURL + finalURL, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const draftOrderingApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Order/draft orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const deliveryPendingApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Order/non delivered orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const reviewOrderApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Order/review orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const historyOrderApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Order/history orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getCustomerDataApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Customer/get customer`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const updateCustomerDataApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + '/Customer/update customer', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getSupplierListAdminApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Supplier/Supplier list`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getCurrentLocUsersAdminApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/User/get current location users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const clonePreviousApi = async supplierId => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/Order/orders by supplier?SupplierId=${supplierId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const inventoryListAdminApi = async supplierId => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL +
      `/InventoryProductMapping/Inventory product mappings by supplierId?supplierId=${supplierId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const supplierAdminApi = async supplierId => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/Product/Products by supplier id?SupplierId=${supplierId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const unMapProductApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + '/InventoryProductMapping/remove product mapping',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const updateInventoryProductApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + '/InventoryProductMapping/update custom fields',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const lookupDepartmentsApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Lookup/Departments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const lookupCategoriesApi = async deptId => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL +
      `/Lookup/Inventory categories by department?DepartmentId=${deptId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getStockDataApi = async (deptId, catId, date) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL +
      `/StockTake/new stock by category?DepartmentId=${deptId}&CategoryId=${catId}&StockTakeDate=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const lookupInsideCategoriesApi = async catId => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/Inventory/inventory levels?CategoryId=${catId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getOrderCategoriesApi = async (catId, supId) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL +
      `/Inventory/inventory list by category and supplier?CategoryId=${catId}&SupplieId=${supId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const inventoryListSetupCatApi = async catId => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/Inventory/inventory list by category?CategoryId=${catId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const deleteInventoryListProductApi = async (payload, id) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Inventory/Delete Inventory?Id=${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getRecipeNamesApi = async catId => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Recipe/recipe names`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getRecipeDetailsApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Recipe/recipe advance details?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getSupplierListSetupApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Supplier/Supplier list`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getMenuItemsSetupApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/menu/menu item list`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const viewMenuItemsSetupApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Menu/menu item by id?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addManualEntrySalesApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/SaleInvoice/add manual entry`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const deleteEventAdminApi = async (payload, id) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Event/delete event?Id=${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getUserNameEventsApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/User/get all location users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addEventAdminApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Event/add event`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getEventDetailsAdminApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Event/Event details?Id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const updateEventAdminApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Event/update event`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getMenuItemsAdminApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Menu/menus`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const deleteOfferEventAdminApi = async (payload, id) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Event/delete event offer?Id=${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const deleteEventItemAdminApi = async (payload, id) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Event/delete event Item?Id=${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getMappedProductsInventoryAdminApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL +
      `/InventoryProductMapping/Inventory product mappings by inventory id?inventoryId=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getDraftOrdersInventoryAdminApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Order/draft orders?supplierId=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addOrderItemAdminApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/add order item`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getSupplierCatalogApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/Product/Products categories by supplier id?SupplierId=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getInventoryByDepartApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/Inventory/get list by department?DepartmentId=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getSupplierProductsApi = async (id, catName, orderId) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  const finalURL = orderId
    ? `/Product/Products by category and supplier id?SupplierId=${id}&Category=${catName}&shopingBasketId=${orderId}`
    : `/Product/Products by category and supplier id?SupplierId=${id}&Category=${catName}`;

  return axios.get(baseURL + finalURL, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const unMapProductAdminApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/InventoryProductMapping/remove product mapping`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const mapProductAdminApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/InventoryProductMapping/add product mapping`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const updateDraftOrderApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/update order`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const updateDraftOrderNewApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/update draft`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getInventoryBySupplierIdApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/lookup/Inventory categories by supplier?SupplierId=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getInsideInventoryNewApi = async (catId, supId, orderId) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  const finalURL = orderId
    ? `/inventory/inventories by category and supplier?CategoryId=${catId}&SupplieId=${supId}&shopingBasketId=${orderId}`
    : `/inventory/inventories by category and supplier?CategoryId=${catId}&SupplieId=${supId}`;

  return axios.get(baseURL + finalURL, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addBasketApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/ShopingBasket/add basket`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getBasketApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/ShopingBasket/Get shoping basket by id?Id=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const updateBasketApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/ShopingBasket/update basket`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const sendOrderApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/send order`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const viewShoppingBasketApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Order/view shoping basket?Id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const downloadPDFApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Order/viewPDF?Id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const viewHTMLApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/order/ViewOrderHTML?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const searchInventoryItemLApi = async (id, searchText) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL +
      `/inventory/search inventory mappings by name and supplier?Name=${searchText}&SupplierId=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const searchSupplierItemLApi = async (id, searchText) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/Product/Search products?Search=${searchText}&SupplierId=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const processPendingOrderApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/process order`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const processPendingOrderItemApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/process order item`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const addNewOrderLineApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/add order items`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getUserLocationApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Location/get user locations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const setCurrentLocation = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/Location/set current location?Id=${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getCurrentUserApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/User/get current user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const revenuePostReportApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Report/Revenue cost report`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const createProspectApi = async payload => {
  return axios.post(baseURL + `/Prospect/create prospect`, payload, {
    headers: {},
  });
};

export const getCasualListNewApi = async () => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Inventory/get list`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getListByDepartment = async DepartmentId => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(
    baseURL + `/Inventory/get list by department?DepartmentId=${DepartmentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const duplicateApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/Order/duplicate order?Id=${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const getOrdersByStatusApi = async (pageNumber, pageSize) => {
  let url =
    baseURL +
    `/CasulPurchase/getlistbypage?PageNumber=${pageNumber}&PageSize=${pageSize}`;
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const orderByStatusApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/get orders by status`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const deliveredDateUpdateApi = async (
  id,
  deliveredDate,
  deliveryDate,
) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL +
      `/Order/process order delivered date?Id=${id}&DeliveredDate=${deliveredDate}&DeliveryDate=${deliveryDate}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const updateOrderStatusApi = async (payload, id, status) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/Order/update order status?Id=${id}&Status=${status}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const updateUserApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/User/update current user`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const validateUserApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/validate delivery date`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const flagApi = async (payload, id, status) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/Order/flag order item?Id=${id}&IsFlagged=${status}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const processDeliveredDateApi = async (
  payload,
  id,
  deliveredDate,
  deliveryDate,
) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL +
      `/Order/process order delivered date?Id=${id}&DeliveredDate=${deliveredDate}&DeliveryDate=${deliveryDate}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const uploadImageApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/upload images`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const getImageApi = async id => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.get(baseURL + `/Order/order images by id?Id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const deleteImageApi = async (id, payload) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(baseURL + `/Order/delete image?Id=${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      LocationId: location,
      Language: language,
    },
  });
};

export const updateCreditNoteApi = async (
  orderItemId,
  value,
  notes,
  payload,
) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL +
      `/SupplierCreditNoteRequest/update credit note value?OrderItemId=${orderItemId}&Value=${value}&Notes=${notes}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const setDeliveryDateApi = async (id, date, payload) => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/Order/set delivery date?Id=${id}&DeliveryDate=${date}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const requestSupplierApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/SupplierRequest/create Supplier request`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};

export const createCollaborationApi = async payload => {
  const token = await AsyncStorage.getItem('@appToken');
  const location = await AsyncStorage.getItem('@location');
  const language = await AsyncStorage.getItem('Language');

  return axios.post(
    baseURL + `/SupplierCollaboration/create collaboration request`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        LocationId: location,
        Language: language,
      },
    },
  );
};
