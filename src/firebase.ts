import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer, Firestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

let activeDb: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)") {
    activeDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    activeDb = getFirestore(app);
  }
} catch (e) {
  activeDb = getFirestore(app);
}

// Proxied Firestore database export to allow dynamic swap of actual instance
export const db = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    return Reflect.get(activeDb, prop, receiver);
  },
  set(target, prop, value, receiver) {
    return Reflect.set(activeDb, prop, value, receiver);
  },
  ownKeys(target) {
    return Reflect.ownKeys(activeDb);
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(activeDb, prop);
  }
});

export const auth = getAuth(app);

export function switchToDefaultDatabase() {
  console.warn("[Firebase] Switching to (default) database fallback!");
  activeDb = getFirestore(app);
}

// Quiet background connection/path check test
async function testConnection() {
  if (!firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === "(default)") {
    return;
  }
  try {
    // Attempt a dry-run metadata request to verify database instance path validation
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes("Invalid path specified in request URL")) {
      console.warn(`[Firebase] Database ID "${firebaseConfig.firestoreDatabaseId}" is not present/valid on project "${firebaseConfig.projectId}". Splicing fallback to default database.`);
      switchToDefaultDatabase();
    }
  }
}
testConnection().catch(() => {});

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  if (errMsg.includes("Invalid path specified in request URL")) {
    switchToDefaultDatabase();
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
