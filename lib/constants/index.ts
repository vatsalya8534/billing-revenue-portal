import { OrderType, PaymentReceived, POStatus, Status } from "@prisma/client";

export const APP_NAME =
  process.env.NEXT_APP_APP_NAME ?? "Billing & Revenue Portal";

export const APP_DESCRIPTION =
  process.env.NEXT_APP_DESCRIPTION ??
  "Internal Billing & Revenue Management System";

export const SERVER_URL =
  process.env.NEXT_APP_SERVER_URL ?? "http://localhost:3000";

export const roleDefaultValues = {
  name: "",
  remark: "",
  status: Status.ACTIVE,
};

export const formatDate = (date?: Date | null) =>
  date ? date.toISOString().split("T")[0] : "";

export const userDefaultValues = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  status: Status.ACTIVE,
  remark: "",
  roleId: "",
};

export const clientDefaultValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gstNumber: "",
  status: Status.ACTIVE,
};

export const purchaseOrderDefaultValues = {
  customerPONumber: "",
  poAmount: 0,

  serviceTypeId: "",
  contractDurationId: "",
  contractId: "",

  startFrom: null as Date | null,
  endDate: null as Date | null,

  paymentTerms: "",
  billingPlanId: "",
  customerId: "",
  poOwner: "",

  status: POStatus.LIVE,
  remark: "",

  ageingDays: "",
  scope: "",

  billingCycles: [
    {
      invoiceNumber: "",
      invoiceAmount: 0,
      collectedAmount: 0,
      invoiceDate: null as Date | null,
      billingSubmittedDate: null as Date | null,
      paymentReceived: PaymentReceived.NO,
      paymentReceivedDate: null as Date | null,
      paymentDueDate: null as Date | null,
      billingRemark: "",
      tds: "",       // added
    },
  ],
};

export const serviceTypeDefaultValues = {
  name: "",
  remark: "",
  status: Status.ACTIVE,
};

export const billingPlanDefaultValues = {
  name: "",
  totalBillingCycles: 0,
  remark: "",
  status: Status.ACTIVE,
  billingCycleType: "START" as "START",
};

export const contractDurationDefaultValues = {
  name: "",
  totalNumberOfMonths: 0,
  remark: "",
  status: Status.ACTIVE,
};

export const contractTypeDefaultValues = {
  name: "",
  remark: "",
  status: Status.ACTIVE,
};

export const customerDefaultValues = {
  customerCode: "",
  phone: "",
  firstName: "",
  lastName: "",
  companyName: "",
  alternatePhone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  gstNumber: "",
  panNumber: "",
  website: "",
  remark: "",
  status: Status.ACTIVE,
};

export const plDefaultValues = {
  companyId: "",
  projectName: "",
  startDate: new Date(),
  endDate: new Date(),
  poValue: 0,
  resourceCount: 0,
  billingPlanId: "",
  orderType: OrderType.OTHER,
  status: Status.INACTIVE,
}

export const companyDefaultValues = {
  name: "",
  companyCode: "",
  email: "",
  phone: "",
  alternatePhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  gstNumber: "",
  panNumber: "",
  cinNumber: "",
  status: Status.INACTIVE,
}