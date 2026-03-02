import { Status } from "@prisma/client";

/* ================= APP CONFIG ================= */

export const APP_NAME =
  process.env.NEXT_APP_APP_NAME ?? "Billing & Revenue Portal";

export const APP_DESCRIPTION =
  process.env.NEXT_APP_DESCRIPTION ??
  "Internal Billing & Revenue Management System";

export const SERVER_URL =
  process.env.NEXT_APP_SERVER_URL ?? "http://localhost:3000";

export const roleDefaultValues = {
  roleName: "",
  createdBy: "",
  remark: "",
};

export const userDefaultValues = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  // roleName: "",
  roleId: 0,
  status: Status.ACTIVE,
  remark: "",
};

export const clientDefaultValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gstNumber: "",
  status: Status.ACTIVE,
};

// export const purchaseOrderDefaultValues = {
//   poNumber: "",
//   serviceType: "",
//   contractType: "",
//   contractDuration: "",
//   startFrom: null as Date | null,
//   endDate: null as Date | null,
//   paymentTerms: "",
//   billingPlan: "",
//   poAmount: 0,
//   remark: "",
//   clientId: "",
//   createdByUserId: "",
//   status: Status.ACTIVE,
// };

export const purchaseOrderDefaultValues = {
  poNumber: "",
  serviceType: "",
  contractType: "",
  contractDuration: "",
  startFrom: "",
  endDate: "",
  paymentTerms: "",
  billingPlan: "",
  poAmount: 0,
  remark: "",
  clientId: 0,
  createdByUserId: 0,
  status: Status.ACTIVE,
};

export const billDefaultValues = {
  billNumber: "",
  billAmount: 0,
  billDate: null as Date | null,
  billSubmittedDate: null as Date | null,
  purchaseOrderId: "",
  clientId: "",
  status: Status.ACTIVE,
};

export const paymentDefaultValues = {
  billId: "",
  receivedAmount: 0,
  receivedDate: null as Date | null,
  remark: "",
};