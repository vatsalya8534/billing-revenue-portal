import { PaymentReceived, POStatus, Status } from "@prisma/client";

export const APP_NAME = process.env.NEXT_APP_APP_NAME ?? "Billing & Revenue Portal";

export const APP_DESCRIPTION = process.env.NEXT_APP_DESCRIPTION ?? "Internal Billing & Revenue Management System";

export const SERVER_URL = process.env.NEXT_APP_SERVER_URL ?? "http://localhost:3000";

export const roleDefaultValues = {
  name: "",
  remark: "",
  status: Status.ACTIVE
};

export const formatDate = (date?: Date | null) => date ? date.toISOString().split("T")[0] : "";

export const userDefaultValues = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  status: Status.ACTIVE,
  remark: "",
  roleId: ""
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
  serviceType: "",
  contractDuration: "",
  contractType: "",
  startFrom: new Date(),
  endDate: new Date(),
  paymentTerms: "",
  billingPlan: "",
  billingNumber: "",
  customerName: "",
  billDate: new Date(),
  billSubmittedDate: new Date(),
  paymentReceived: PaymentReceived.NO,
  paymentReceivedDate: new Date(),
  paymentReceivedAmount: 0,
  status: POStatus.PENDING,
  remark: "",
};

export const serviceTypeDefaultValues = {
  name: "",
  remark: "",
  status: Status.ACTIVE
}


export const billingPlanDefaultValues = {
  name: "",
  totalBillingCycles: 0,
  remark: "",
  status: Status.ACTIVE
}

export const contractTypeDefaultValues = {
  name: "",
  remark: "",
  status: Status.ACTIVE
}
