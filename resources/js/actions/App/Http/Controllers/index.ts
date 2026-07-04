import ReloadlyWebhookController from './ReloadlyWebhookController'
import StripeWebhookController from './StripeWebhookController'
import DocumentationController from './DocumentationController'
import ImpersonationController from './ImpersonationController'
import DashboardController from './DashboardController'
import NotificationController from './NotificationController'
import TopUpController from './TopUpController'
import GiftCardController from './GiftCardController'
import BulkController from './BulkController'
import RecipientController from './RecipientController'
import AutomationController from './AutomationController'
import WalletController from './WalletController'
import TransactionController from './TransactionController'
import ReportsController from './ReportsController'
import CopilotController from './CopilotController'
import DeveloperController from './DeveloperController'
import SupportController from './SupportController'
import ResellerCustomerController from './ResellerCustomerController'
import ResellerEarningsController from './ResellerEarningsController'
import Admin from './Admin'
import Settings from './Settings'

const Controllers = {
    ReloadlyWebhookController: Object.assign(ReloadlyWebhookController, ReloadlyWebhookController),
    StripeWebhookController: Object.assign(StripeWebhookController, StripeWebhookController),
    DocumentationController: Object.assign(DocumentationController, DocumentationController),
    ImpersonationController: Object.assign(ImpersonationController, ImpersonationController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    NotificationController: Object.assign(NotificationController, NotificationController),
    TopUpController: Object.assign(TopUpController, TopUpController),
    GiftCardController: Object.assign(GiftCardController, GiftCardController),
    BulkController: Object.assign(BulkController, BulkController),
    RecipientController: Object.assign(RecipientController, RecipientController),
    AutomationController: Object.assign(AutomationController, AutomationController),
    WalletController: Object.assign(WalletController, WalletController),
    TransactionController: Object.assign(TransactionController, TransactionController),
    ReportsController: Object.assign(ReportsController, ReportsController),
    CopilotController: Object.assign(CopilotController, CopilotController),
    DeveloperController: Object.assign(DeveloperController, DeveloperController),
    SupportController: Object.assign(SupportController, SupportController),
    ResellerCustomerController: Object.assign(ResellerCustomerController, ResellerCustomerController),
    ResellerEarningsController: Object.assign(ResellerEarningsController, ResellerEarningsController),
    Admin: Object.assign(Admin, Admin),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers