import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/Home';
import MepScreen from '../screens/Mep';
import MepAdvanceScreen from '../screens/MepAdvance';
import StockTakeScreen from '../screens/StockTake';
import ManualLogScreen from '../screens/ManualLog';
import MyProfile from '../screens/MyProfile';
import CasualPurchaseScreen from '../screens/CasualPurchase';
import MenuItemsScreen from '../screens/MenuItems';
import DeliveriesScreen from '../screens/Deliveries';
import EventsScreen from '../screens/Events';
import EditPurchase from '../screens/CasualPurchase/EditPurchase';
import StockScreen from '../screens/StockTake/StockScreen';
import AdminScreen from '../screens/Home/Admin';
import SetupScreen from '../screens/Home/Setup';
import InboxScreen from '../screens/Home/Inbox';
import SalesAdminScreen from '../screens/Home/Admin/Sales/Sales';
import AccountAdminScreen from '../screens/Home/Admin/Account/Account';
import EventsAdminScreen from '../screens/Home/Admin/Events/Events';
import AddNewEventAdminScreen from '../screens/Home/Admin/Events/AddNewEvent';
import InventoryAdminScreen from '../screens/Home/Admin/Inventory/Inventory';
import OrderingAdminScreen from '../screens/Home/Admin/Ordering';
import NewOrderScreen from '../screens/Home/Admin/Ordering/AddOrder/NewOrder';
import NewOrderSecScreen from '../screens/Home/Admin/Ordering/AddOrder/NewOrderSec';
import NewOrderThirdScreen from '../screens/Home/Admin/Ordering/AddOrder/NewOrderThird';
import OrderingThreeAdminScreen from '../screens/Home/Admin/Ordering/OrderingThree';
import DraftOrderAdminScreen from '../screens/Home/Admin/Ordering/DraftOrders/DraftOrder';
import ViewDraftOrdersScreen from '../screens/Home/Admin/Ordering/DraftOrders/ViewDraftOrders';
import PendingDeliveryAdminScreen from '../screens/Home/Admin/Ordering/PendingDelivery/PendingDelivery';
import RequestCreditNoteScreen from '../screens/Home/Admin/Ordering/PendingDelivery/RequestCreditNote';
import ViewPendingDeliveryScreen from '../screens/Home/Admin/Ordering/PendingDelivery/ViewPendingDelivery';
import PendingOrderDeliveryScreen from '../screens/Home/Admin/Ordering/PendingDelivery/PendingOrderDelivery';
import HistoryOrderDeliveryScreen from '../screens/Home/Admin/Ordering/HistoryOrder/HistoryOrderDelivery';
import ReportsAdminScreen from '../screens/Home/Admin/Reports/Reports';
import GrossMarginAdminScreen from '../screens/Home/Admin/Reports/GrossMargin';
import MenuAnalysisAdminScreen from '../screens/Home/Admin/Reports/MenuAnalysis';
import InventorySetupScreen from '../screens/Home/Setup/Inventory';
import MenuItemScreen from '../screens/Home/Setup/MenuItem';
import MenusScreen from '../screens/Home/Setup/Menus/Menus';
import RecipeSetupScreen from '../screens/Home/Setup/Recipe';
import SupplierScreen from '../screens/Home/Setup/Supplier';
import MenuAnalysisSec from '../screens/Home/Admin/Reports/MenuAnalysisSec';
import SalesAdminSec from '../screens/Home/Admin/Sales/SalesSec';
import InventoryAdminSec from '../screens/Home/Admin/Inventory/InventorySec';
import OrderNowInventoryAdminScreen from '../screens/Home/Admin/Inventory/OrderNow';
import InventorySetupSecScreen from '../screens/Home/Setup/Inventory/InventorySetupSec';
import EditInventorySetupScreen from '../screens/Home/Setup/Inventory/EditInventorySetup';
import ViewRecipeScreen from '../screens/Home/Setup/Recipe/ViewRecipe';
import ViewSupplierScreen from '../screens/Home/Setup/Supplier/ViewSupplier';
import ViewMenuItemsScreen from '../screens/Home/Setup/MenuItem/ViewMenuItems';
import ViewEventAdminScreen from '../screens/Home/Admin/Events/ViewEvent';
import EditEventAdminScreen from '../screens/Home/Admin/Events/EditEvent';
import EditStockScreen from '../screens/StockTake/EditStock';
import NewStockScreen from '../screens/StockTake/NewStock';
import HistoryStockScreen from '../screens/StockTake/HistoryStock';
import AddBuilderMepScreen from '../screens/Mep/AddBuilder';
import ViewRecipeMepScreen from '../screens/Mep/ViewRecipe';
import ViewInventoryMepScreen from '../screens/MepAdvance/ViewInventory';
import AddPurchaseScreen from '../screens/CasualPurchase/AddPurchase';
import DepartmentPurchaseScreen from '../screens/CasualPurchase/DepartmentPurchase';
import SupplierListScreen from '../screens/CasualPurchase/SupplierList';
import ViewPurchaseScreen from '../screens/CasualPurchase/ViewPurchase';
import DepartmentPurchaseSecScreen from '../screens/CasualPurchase/DepartmentPurchaseSec';
import AddItemsOrderScreen from '../screens/Home/Admin/Ordering/AddOrder/AddItems';
import InventoryListOrderScreen from '../screens/Home/Admin/Ordering/AddOrder/InventoryList';
import SupplierlistOrderScreen from '../screens/Home/Admin/Ordering/AddOrder/Supplierlist';
import BasketOrderScreen from '../screens/Home/Admin/Ordering/AddOrder/Basket';
import MapProductsListScreen from '../screens/Home/Admin/Ordering/AddOrder/MapProductsList';
import EditDraftOrderScreen from '../screens/Home/Admin/Ordering/DraftOrders/EditDraftOrder';
import PdfViewScreen from '../screens/Home/Admin/Ordering/AddOrder/PdfView';
import SearchInventoryScreen from '../screens/Home/Admin/Ordering/AddOrder/SearchInventory';
import SearchSupplierScreen from '../screens/Home/Admin/Ordering/AddOrder/SearchSupplier';
import PdfViewDraftScreen from '../screens/Home/Admin/Ordering/DraftOrders/PdfViewDraft';
import ViewReviewOrderScreen from '../screens/Home/Admin/Ordering/ReviewOrder/ViewReviewOrder';
import ReviewOrderDeliveryScreen from '../screens/Home/Admin/Ordering/ReviewOrder/ReviewOrderDelivery';
import ViewHistoryOrderScreen from '../screens/Home/Admin/Ordering/HistoryOrder/ViewHistoryOrder';
import HistroyDataScreen from '../screens/StockTake/HistroyData';
import DashboardScreen from '../screens/Dashboard';
import AddNewOrderLineScreen from '../screens/Home/Admin/Ordering/PendingDelivery/AddNewOrderLine';
import SupplierListNewOrderLineScreen from '../screens/Home/Admin/Ordering/PendingDelivery/SupplierListNewOrderLine';
import EditHistoryOrderScreen from '../screens/Home/Admin/Ordering/HistoryOrder/EditHistoryOrder';
import CategoryStockScreen from '../screens/StockTake/CategoryStockScreen';
import AddManualLogScreen from '../screens/ManualLog/AddManualLog';
import EditManualLogScreen from '../screens/ManualLog/EditManualLog';
import FilterPurchaseScreen from '../screens/CasualPurchase/FilterPurchase';
import OrderCreationScreen from '../screens/Home/Admin/Ordering/AddOrder/OrderCreationScreen';
import FilterOrderScreen from '../screens/Home/Admin/Ordering/FilterOrder';
import SupplierAdminScreen from '../screens/Home/Admin/Supplier/SupplierList';
import SupplierDetailScreen from '../screens/Home/Admin/Supplier/SupplierDetail';
import InviteSupplierScreen from '../screens/Home/Admin/Supplier/InviteSupplier';
import SupplierListNoAccScreen from '../screens/Home/Admin/Supplier/SupplierListNoAcc';

const AppNav = createStackNavigator();

export default function AppNavFun() {
  return (
    <AppNav.Navigator
      headerMode="none"
      initialRouteName="HomeScreen"
      screenOptions={{gestureEnabled: false}}>
      <AppNav.Screen name="HomeScreen" component={HomeScreen} />
      <AppNav.Screen name="DashboardScreen" component={DashboardScreen} />
      <AppNav.Screen
        name="AddNewOrderLineScreen"
        component={AddNewOrderLineScreen}
      />
      <AppNav.Screen name="FilterOrderScreen" component={FilterOrderScreen} />
      <AppNav.Screen
        name="EditManualLogScreen"
        component={EditManualLogScreen}
      />
      <AppNav.Screen
        name="EditHistoryOrderScreen"
        component={EditHistoryOrderScreen}
      />

      <AppNav.Screen
        name="SupplierAdminScreen"
        component={SupplierAdminScreen}
      />

      <AppNav.Screen
        name="SupplierDetailScreen"
        component={SupplierDetailScreen}
      />

      <AppNav.Screen
        name="CategoryStockScreen"
        component={CategoryStockScreen}
      />

      <AppNav.Screen
        name="RequestCreditNoteScreen"
        component={RequestCreditNoteScreen}
      />

      <AppNav.Screen name="AddManualLogScreen" component={AddManualLogScreen} />
      <AppNav.Screen
        name="SupplierListNewOrderLineScreen"
        component={SupplierListNewOrderLineScreen}
      />
      <AppNav.Screen name="MepScreen" component={MepScreen} />
      <AppNav.Screen name="MepAdvanceScreen" component={MepAdvanceScreen} />
      <AppNav.Screen name="ManualLogScreen" component={ManualLogScreen} />
      <AppNav.Screen name="MyProfile" component={MyProfile} />
      <AppNav.Screen name="StockTakeScreen" component={StockTakeScreen} />
      <AppNav.Screen name="NewStockScreen" component={NewStockScreen} />
      <AppNav.Screen name="HistoryStockScreen" component={HistoryStockScreen} />
      <AppNav.Screen
        name="InventoryListOrderScreen"
        component={InventoryListOrderScreen}
      />
      <AppNav.Screen name="HistroyDataScreen" component={HistroyDataScreen} />
      <AppNav.Screen
        name="ViewReviewOrderScreen"
        component={ViewReviewOrderScreen}
      />

      <AppNav.Screen
        name="ReviewOrderDeliveryScreen"
        component={ReviewOrderDeliveryScreen}
      />

      <AppNav.Screen
        name="ViewHistoryOrderScreen"
        component={ViewHistoryOrderScreen}
      />
      <AppNav.Screen name="PdfViewDraftScreen" component={PdfViewDraftScreen} />
      <AppNav.Screen
        name="SearchInventoryScreen"
        component={SearchInventoryScreen}
      />
      <AppNav.Screen
        name="SearchSupplierScreen"
        component={SearchSupplierScreen}
      />
      <AppNav.Screen name="PdfViewScreen" component={PdfViewScreen} />
      <AppNav.Screen
        name="CasualPurchaseScreen"
        component={CasualPurchaseScreen}
      />

      <AppNav.Screen
        name="DepartmentPurchaseSecScreen"
        component={DepartmentPurchaseSecScreen}
      />

      <AppNav.Screen
        name="EditDraftOrderScreen"
        component={EditDraftOrderScreen}
      />
      <AppNav.Screen
        name="MapProductsListScreen"
        component={MapProductsListScreen}
      />
      <AppNav.Screen
        name="SupplierlistOrderScreen"
        component={SupplierlistOrderScreen}
      />
      <AppNav.Screen name="BasketOrderScreen" component={BasketOrderScreen} />
      <AppNav.Screen
        name="AddItemsOrderScreen"
        component={AddItemsOrderScreen}
      />
      <AppNav.Screen
        name="OrderNowInventoryAdminScreen"
        component={OrderNowInventoryAdminScreen}
      />
      <AppNav.Screen
        name="ViewPendingDeliveryScreen"
        component={ViewPendingDeliveryScreen}
      />

      <AppNav.Screen
        name="PendingOrderDeliveryScreen"
        component={PendingOrderDeliveryScreen}
      />

      <AppNav.Screen
        name="HistoryOrderDeliveryScreen"
        component={HistoryOrderDeliveryScreen}
      />

      <AppNav.Screen name="AddPurchaseScreen" component={AddPurchaseScreen} />
      <AppNav.Screen name="ViewPurchaseScreen" component={ViewPurchaseScreen} />
      <AppNav.Screen
        name="AddBuilderMepScreen"
        component={AddBuilderMepScreen}
      />
      <AppNav.Screen
        name="ViewInventoryMepScreen"
        component={ViewInventoryMepScreen}
      />
      <AppNav.Screen
        name="ViewRecipeMepScreen"
        component={ViewRecipeMepScreen}
      />
      <AppNav.Screen name="EditStockScreen" component={EditStockScreen} />
      <AppNav.Screen name="MenuItemsScreen" component={MenuItemsScreen} />
      <AppNav.Screen name="DeliveriesScreen" component={DeliveriesScreen} />
      <AppNav.Screen name="EventsScreen" component={EventsScreen} />
      <AppNav.Screen name="EditPurchase" component={EditPurchase} />
      <AppNav.Screen name="StockScreen" component={StockScreen} />
      <AppNav.Screen name="SalesAdminScreen" component={SalesAdminScreen} />
      <AppNav.Screen name="AccountAdminScreen" component={AccountAdminScreen} />
      <AppNav.Screen name="EventsAdminScreen" component={EventsAdminScreen} />
      <AppNav.Screen
        name="AddNewEventAdminScreen"
        component={AddNewEventAdminScreen}
      />
      <AppNav.Screen
        name="ViewEventAdminScreen"
        component={ViewEventAdminScreen}
      />
      <AppNav.Screen
        name="EditEventAdminScreen"
        component={EditEventAdminScreen}
      />
      <AppNav.Screen
        name="InventoryAdminScreen"
        component={InventoryAdminScreen}
      />
      <AppNav.Screen
        name="OrderingAdminScreen"
        component={OrderingAdminScreen}
      />
      <AppNav.Screen name="ReportsAdminScreen" component={ReportsAdminScreen} />
      <AppNav.Screen name="NewOrderScreen" component={NewOrderScreen} />
      <AppNav.Screen name="NewOrderSecScreen" component={NewOrderSecScreen} />

      <AppNav.Screen
        name="OrderingThreeAdminScreen"
        component={OrderingThreeAdminScreen}
      />
      <AppNav.Screen
        name="InventorySetupScreen"
        component={InventorySetupScreen}
      />
      <AppNav.Screen name="MenuItemScreen" component={MenuItemScreen} />
      <AppNav.Screen name="MenusScreen" component={MenusScreen} />
      <AppNav.Screen name="RecipeSetupScreen" component={RecipeSetupScreen} />
      <AppNav.Screen name="SupplierScreen" component={SupplierScreen} />
      <AppNav.Screen name="AdminScreen" component={AdminScreen} />
      <AppNav.Screen name="SetupScreen" component={SetupScreen} />
      <AppNav.Screen name="InboxScreen" component={InboxScreen} />
      <AppNav.Screen
        name="GrossMarginAdminScreen"
        component={GrossMarginAdminScreen}
      />
      <AppNav.Screen
        name="MenuAnalysisAdminScreen"
        component={MenuAnalysisAdminScreen}
      />
      <AppNav.Screen name="MenuAnalysisSec" component={MenuAnalysisSec} />
      <AppNav.Screen name="SalesAdminSec" component={SalesAdminSec} />
      <AppNav.Screen name="InventoryAdminSec" component={InventoryAdminSec} />
      <AppNav.Screen
        name="DraftOrderAdminScreen"
        component={DraftOrderAdminScreen}
      />
      <AppNav.Screen
        name="ViewDraftOrdersScreen"
        component={ViewDraftOrdersScreen}
      />
      <AppNav.Screen
        name="PendingDeliveryAdminScreen"
        component={PendingDeliveryAdminScreen}
      />
      <AppNav.Screen
        name="InventorySetupSecScreen"
        component={InventorySetupSecScreen}
      />
      <AppNav.Screen
        name="EditInventorySetupScreen"
        component={EditInventorySetupScreen}
      />
      <AppNav.Screen name="ViewRecipeScreen" component={ViewRecipeScreen} />
      <AppNav.Screen name="ViewSupplierScreen" component={ViewSupplierScreen} />
      <AppNav.Screen
        name="ViewMenuItemsScreen"
        component={ViewMenuItemsScreen}
      />
      <AppNav.Screen
        name="FilterPurchaseScreen"
        component={FilterPurchaseScreen}
      />
      <AppNav.Screen name="SupplierListScreen" component={SupplierListScreen} />
      <AppNav.Screen
        name="DepartmentPurchaseScreen"
        component={DepartmentPurchaseScreen}
      />
      <AppNav.Screen
        name="OrderCreationScreen"
        component={OrderCreationScreen}
      />
      <AppNav.Screen
        name="NewOrderThirdScreen"
        component={NewOrderThirdScreen}
      />

      <AppNav.Screen
        name="InviteSupplierScreen"
        component={InviteSupplierScreen}
      />

      <AppNav.Screen
        name="SupplierListNoAccScreen"
        component={SupplierListNoAccScreen}
      />
    </AppNav.Navigator>
  );
}
