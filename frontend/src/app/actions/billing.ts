"use server";

import { getSession } from "./auth";

const API_BASE_URL = "http://backend:3000/api/v1";

async function fetchApi(endpoint, options = {}) {
  const session = await getSession();

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${session.authorization}`,
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok)
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);

  return res.json();
}

export async function getUsers() {
  return fetchApi(`/users`);
}

export async function getBills(userId: string, page: number) {
  return fetchApi(`/users/${userId}/bills?page=${page}`);
}

export async function getDebts(userId: string, page: number) {
  return fetchApi(`/users/${userId}/debts?page=${page}`);
}

export async function getAmountOwed(userId: string) {
  return fetchApi(`/users/${userId}/amount_owed`);
}

export async function getAmountReceivable(userId: string) {
  return fetchApi(`/users/${userId}/amount_receivable`);
}

export async function createBill({
  user_id,
  name,
  amount,
  due_date,
  user_amounts,
}) {
  const data = {
    bill: {
      user_id,
      name,
      amount,
      due_date,
      user_amounts,
    },
  };
  try {
    return fetchApi(`/bills`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    return { error: "An error occurred when creating the bill." };
  }
}

export async function settleDebt(billId: string, userId: string) {
  return fetchApi(`/user_debts/settle`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, bill_id: billId }),
  });
}
